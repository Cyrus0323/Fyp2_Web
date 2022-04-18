import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Upload } from 'antd'
import ImgCrop from 'antd-img-crop'
import { push, ref, set } from 'firebase/database'
import AWS from 'aws-sdk'
import { isEmpty, random } from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import { db } from '../../../../../firebase/firebase'
import globalStore from '../../../../../lib/store/global'
import { useParams } from 'react-router-dom'

window.Buffer = window.Buffer || require('buffer').Buffer

const MedicationForm = ({ form, action }) => {
  const { modalVisible, isLoading, selectedRow } = useSnapshot(globalStore)
  const params = useParams()
  const [isRemoved, setIsRemoved] = useState(true)
  const [isUpdated, setIsUpdated] = useState(false)
  const [fileList, setFileList] = useState([])

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
  })

  const S3Bucket = new AWS.S3({
    params: { Bucket: process.env.REACT_APP_S3_BUCKET },
    region: process.env.REACT_APP_REGION
  })

  const handleSubmit = (values) => {
    const dateNow = moment().format('YYYY-MM-DD HH:mm:ss').toString()

    if (fileList.length > 0) {
      // console.log(fileList)
      const file = fileList[0].url
      values.image_url = file
    }

    globalStore.isLoading = true
    if (action === 'add') {
      const medicationRef = ref(db, `Users/${params.key}/Medication`)
      push(medicationRef, {
        name: values.name,
        volume: values.volume,
        description: values.description,
        image_url: values.image_url,
        createdAt: dateNow,
        updatedAt: dateNow
      })
      message.success('Medication added successfully')
    } else {
      const medicationRef = ref(db, `Users/${params.key}/Medication/${selectedRow.key}`)
      set(medicationRef, {
        name: values.name,
        volume: values.volume,
        description: values.description,
        image_url: values.image_url,
        createdAt: selectedRow.createdAt,
        updatedAt: dateNow
      })
      message.success('Medication updated successfully')
    }
    globalStore.isLoading = false
    globalStore.modalVisible = false
    globalStore.refresh = random(1, true)
  }

  const initialValues = {
    ...selectedRow,
    name: selectedRow ? selectedRow.name : null
  }

  const resetForm = () => {
    form.resetFields()
  }

  useEffect(() => {
    resetForm()
    if (selectedRow) {
      setIsRemoved(false)
    }
  }, [])

  const handleRemove = async (file) => {
    const index = fileList.indexOf(file)
    const newFileList = fileList.slice()
    newFileList.splice(index, 1)
    setFileList(newFileList)
    setIsUpdated(true)
    setIsRemoved(true)
  }

  const handleUpload = async (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!')
      return false
    }
    try {
      const params = {
        Body: file,
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: file.name
      }

      const upload = await S3Bucket.upload(params).promise()
      // console.log(upload.Location)

      if (upload) {
        setFileList([
          {
            ...file,
            url: upload.Location
          }
        ])
        setIsUpdated(true)
        setIsRemoved(false)
      }
    } catch (error) {
      message.error(`Upload failed : ${error?.data?.statusText ?? error?.message ?? 'unknown'}`)
    }
  }

  return (
    <Modal
      width="70vh"
      title={action === 'add' ? `Add New Medication` : `Update Medication`}
      onCancel={() => {
        globalStore.modalVisible = false
        globalStore.selectedRow = null
      }}
      centered={true}
      visible={modalVisible}
      footer={[
        <Button key="reset" onClick={resetForm} danger>
          Reset
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit} loading={isLoading}>
          Submit
        </Button>
      ]}
      maskClosable={false}
    >
      <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          key="volume"
          name="volume"
          label="Volume"
          rules={[{ required: true, message: 'Volume is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          key="description"
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Description is required' }
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          key="image_url"
          name="image_url"
          label="Image"
          rules={[{ required: isEmpty(fileList) ? true : false, message: 'Image is required' }]}
        >
          <ImgCrop>
            <Upload
              listType="picture-card"
              multiple={false}
              {...(selectedRow?.image_url && {
                defaultFileList: [
                  {
                    uid: 1,
                    status: 'done',
                    url: selectedRow?.image_url
                  }
                ]
              })}
              {...(isUpdated && { fileList: fileList })}
              beforeUpload={(file) => {
                handleUpload(file)
                return false
              }}
              onRemove={handleRemove}
              showUploadList={{ showPreviewIcon: false }}
            >
              {fileList.length >= 1 || (selectedRow?.image_url && !isRemoved) ? null : (
                <div>
                  <PlusOutlined />
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default MedicationForm
