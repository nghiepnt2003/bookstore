import React, { memo } from 'react'
import clsx from 'clsx'

const InputForm = ({style, label, disabled, register, errols, id, validate, type='text', placeholder, fw, defaultValue, value}) => {
    return (
        <div className={clsx('flex flex-col h-[78px] gap-2', style)}>
            {label && <label htmlFor={id}>{label}</label>}
            <input 
            type={type}
            id={id}
            {...register(id, validate)}
            disabled={disabled}
            placeholder={placeholder}
            className={clsx('form-input px-[20px] my-auto border border-main', fw && 'w-full', style)}
            defaultValue={defaultValue}
            value={value}
            />
            {errols[id] && <small className='text-xs text-red-500'>{errols[id]?.message}</small>}
        </div>
    )
}

export default memo(InputForm)