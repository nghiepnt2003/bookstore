import React from 'react'


const InputField = ({value, setValue, nameKey, type, invalidFields, setInvalidFieds}) => {
  
  return (
    <div className='w-full relative'>
        {value!=='' && <label className='text-[10px] animate-slide-top-sm absolute top-0 left-[12px] block bg-white p-1' htmlFor= {nameKey}>{nameKey ? nameKey.charAt(0).toUpperCase() + nameKey.slice(1) : ''}</label>}
        <input
          type={type || 'text'}
          className='px-4 py-2 rounded-sm border w-full my-4'
          placeholder={nameKey ? nameKey.charAt(0).toUpperCase() + nameKey.slice(1) : ''}
          value={value}
          onChange={e => setValue(prev => ({...prev, [nameKey]: e.target.value}))}          
        />
    </div>
  )
}

export default InputField
