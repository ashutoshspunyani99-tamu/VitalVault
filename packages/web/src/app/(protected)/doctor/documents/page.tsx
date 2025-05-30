'use client'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { APP_NAME, APP_NAME_TITLE } from '@/helper/constants'
import { openModal, closeModal, updateModal } from '@/components/features/common/modalSlice'
import TitleCard from '@/components/cards/title-card'
import { gql, useMutation, useQuery } from '@apollo/client'
import ErrorText from '@/components/typography/error-text'
import { DocumentsListData, PatientsListData } from '@/lib/models'
import Head from 'next/head'
import SuccessText from '@/components/typography/success-text'

function Documents() {
  const dispatch = useAppDispatch()
  const [patientsList, setPatientsList] = useState<PatientsListData[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientsListData>()
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  let currentFileUploadData: File | null = null

  const FETCH_PATIENTS = gql`
    query FetchPatients {
      fetchPatients {
        createdAt
        email
        id
        name
        updatedAt
        patientFiles {
          createdAt
          fileName
          id
          ipfsCid
          updatedAt
        }
      }
    }
  `

  const GENERATE_PRE_SIGNED_UPLOAD_URL = gql`
    mutation GeneratePreSignedUploadUrl($userId: ID!) {
      generatePreSignedUploadUrl(userId: $userId)
    }
  `
  const [
    generatePreSignedUploadUrlGql,
    {
      data: generatePreSignedUploadUrlData,
      loading: generatePreSignedUploadUrlLoading,
      error: generatePreSignedUploadUrlError
    }
  ] = useMutation(GENERATE_PRE_SIGNED_UPLOAD_URL, {
    context: { appTokenName: APP_NAME + ':token' }
  })

  const {
    data: patientsListData,
    error: patientsListDataError,
    refetch: patientsListDataRefetch
  } = useQuery(FETCH_PATIENTS, {
    context: { appTokenName: APP_NAME + ':token' }
  })

  useEffect(() => {
    const docsData = patientsListData?.fetchPatients
    if (docsData) {
      setPatientsList(docsData)
    }
  }, [patientsListData])

  useEffect(() => {
    if (selectedPatientId) {
      const filteredPatient = patientsList.filter((ele) => {
        return selectedPatientId == ele.id
      })
      if (filteredPatient[0]) {
        setSelectedPatient(filteredPatient[0])
      } else {
        setSelectedPatientId('')
      }
    }
  }, [selectedPatientId])

  const onPatientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(event.target.value)
  }

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileData = event?.target?.files
    if (fileData && fileData?.length > 0) {
      currentFileUploadData = fileData[0]
    }
  }

  const uploadFileModal = () => {
    dispatch(() => {
      dispatch(
        openModal({
          title: 'Upload A File',
          bodyContent: (
            <>
              <div className="w-3/5 m-auto">
                <form onSubmit={uploadFileDocument}>
                  <div className="grid">
                    <input
                      type="file"
                      className="file-input file-input-bordered file-input-primary w-full"
                      onChange={onFileInputChange}
                    />
                  </div>
                  <div className="grid mt-7">
                    <button type="submit" className="btn px-6 btn-md normal-case btn-primary">
                      Upload File
                    </button>
                  </div>
                </form>
              </div>
            </>
          ),
          response: <></>
        })
      )
    })
  }

  const closeUploadModal = () => {
    dispatch(() => {
      dispatch(closeModal())
    })
    patientsListDataRefetch()
  }

  const updateUploadModal = (responseData: JSX.Element) => {
    dispatch(
      updateModal({
        response: responseData
      })
    )
  }

  const uploadFileDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploadLoading(true)
    if (!currentFileUploadData) {
      updateUploadModal(
        <>
          <ErrorText styleClass="mt-8">File has been not uploaded.</ErrorText>
        </>
      )
      return
    }
    // try {
    await generatePreSignedUploadUrlGql({
      variables: { userId: selectedPatientId }
    })
      .then(async (res) => {
        const uploadUrlApi = res?.data?.generatePreSignedUploadUrl
        if (uploadUrlApi) {
          let formData = new FormData()
          currentFileUploadData?.arrayBuffer().then(async (arrayBufferData) => {
            const blobData = new Blob([arrayBufferData], { type: currentFileUploadData?.type })
            formData.append('file', blobData, currentFileUploadData?.name)
            await fetch(uploadUrlApi, {
              body: formData,
              method: 'POST'
            })
              .then((uploadRes) => {
                if (uploadRes.status === 200) {
                  updateUploadModal(
                    <>
                      <SuccessText styleClass="mt-8">File Uploaded successfully.</SuccessText>
                    </>
                  )
                  closeUploadModal()
                } else {
                  updateUploadModal(
                    <>
                      <ErrorText styleClass="mt-8">{uploadRes.statusText}</ErrorText>
                    </>
                  )
                }
              })
              .catch((uploadError) => {
                console.error({ uploadError })
                updateUploadModal(
                  <>
                    <ErrorText styleClass="mt-8">{JSON.stringify(uploadError, null, 2)}</ErrorText>
                  </>
                )
              })
          })
        } else {
          updateUploadModal(
            <>
              <ErrorText styleClass="mt-8">Upload URL is not valid.</ErrorText>
            </>
          )
        }
      })
      .catch((error) => {
        console.error({ error })
        updateUploadModal(
          <>
            <ErrorText styleClass="mt-8">{error?.message}</ErrorText>
          </>
        )
      })
  }

  return (
    <>
      <Head>
        <title>{APP_NAME_TITLE} | Doctor - Documents</title>
      </Head>
      <div className="form-control w-full mt-4">
        <label className="label">
          <p>Select a patient to upload documents</p>
        </label>
        {patientsList.length > 0 && (
          <select onChange={onPatientChange} defaultValue="" className="select select-bordered w-full max-w-md">
            <option disabled value="">
              Select an email address
            </option>
            {patientsList.map((pat: PatientsListData, k: number) => (
              <option key={k} value={pat.id}>
                {pat.email}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedPatient && (
        <TitleCard
          title="Medical Documents"
          topMargin="mt-2"
          TopSideButtons={
            <div className="inline-block float-right">
              <button className="btn px-6 btn-sm normal-case btn-primary" onClick={uploadFileModal}>
                Upload
              </button>
            </div>
          }
        >
          {!selectedPatient?.patientFiles?.length && <ErrorText styleClass="mt-8">{'No Documents Found'}</ErrorText>}
          {selectedPatient?.patientFiles.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>File Name</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPatient.patientFiles.map((doc: DocumentsListData, k: number) => (
                    <tr key={k}>
                      <td>{k + 1}</td>
                      <td>{doc.fileName}</td>
                      <td>{doc.createdAt}</td>
                      <td>{doc.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TitleCard>
      )}
      {patientsListDataError?.message && <ErrorText styleClass="mt-8">{patientsListDataError.message}</ErrorText>}
    </>
  )
}

export default Documents
