import { useEffect, useState } from 'react'

function Clock() {
    const [time, setTime] = useState(new Date());


    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);



  return (
        <div>
            <div className='text-3xl font-bold -mb-1'>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div className='text-sm'>{time.toLocaleString('default', { weekday: 'short' })}, {time.toLocaleString('default', { month: 'short' })} {time.getDate()}, {time.getFullYear()}</div>
        </div>

  )
}

export default Clock
