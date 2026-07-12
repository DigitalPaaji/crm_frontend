import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { base_url } from '../../components/utlis'
import { useSelector } from 'react-redux'
import ClientLeadSide from '../../components/ClientLeadSide'
import LeadSide from '../../components/LeadSide'

const SubClientSingleLead = () => {
const {id}= useParams()
  const { token } = useSelector((state) => state.subuser);


  return (
    <div className='grid grid-cols-5 gap-5'>
    <div className='col-span-2'>
    <ClientLeadSide id={id} token={token} />
    </div>
   <div className='col-span-3'>
<LeadSide id={id} token={token}  />

   </div>




    </div>
  )
}

export default SubClientSingleLead
