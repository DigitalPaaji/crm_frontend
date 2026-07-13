import React, { useState } from 'react'
import CreateClientCompo from '../../components/CreateClientCompo'
import GetAllClients from '../../components/GetAllClients'

const CreaetClients = () => {
  const [createClientToggle,setCreatClientToggle]=useState(false)
  return (
    <div>

{createClientToggle ? 
 <CreateClientCompo  setCreatClientToggle={setCreatClientToggle} />
:
<GetAllClients setCreatClientToggle={setCreatClientToggle} />

}


    </div>
  )
}

export default CreaetClients