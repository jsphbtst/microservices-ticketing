import React, { useState } from 'react'
import axios from 'axios'

const useRequest = ({ url, method, body, onSuccess }) => {
	const [errors, setErrors] = useState(null)

	const doRequest = async (props = {}) => {
		setErrors(null)
		try {
			const response = await axios[method](url, { ...body, ...props })

			if (onSuccess) {
				onSuccess(response.data)
			}

			return response.data
		} catch (err) {
			setErrors(
				<div style={{ marginTop: '10px' }}>
					{err.response.data.errors.map(error => (
						<div className='alert alert-danger'>{error.message}</div>
					))}
				</div>
			)
		}
	}

	return {
		doRequest,
		errors
	}
}

export default useRequest
