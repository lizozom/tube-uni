import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { getUUID, setUUID } from '../components/storage'

function useUUID () {
  const [userId] = useState(() => {
    const storedUserId = getUUID()
    return storedUserId || uuidv4()
  })

  useEffect(() => {
    if (!getUUID()) {
      setUUID(userId)
    }
  }, [userId])

  return userId
}

export default useUUID
