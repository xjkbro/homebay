import { useEffect, useState } from 'react'
import { fetchSchoolMenu } from '../lib/mealService'

function SchoolLunch() {
    const [lunchItems, setLunchItems] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [hasMenu, setHasMenu] = useState(true)

    const fetchLunchMenu = async () => {
        const date = new Date()
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

        const menu = await fetchSchoolMenu(formattedDate)
        if (menu.length > 0 && menu[0].lunch && menu[0].lunch.length > 0) {
            setLunchItems(menu[0].lunch)
            setHasMenu(true)
        } else {
            setLunchItems([])
            setHasMenu(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchLunchMenu()
    }, [])

    // Auto-refresh at midnight
    useEffect(() => {
        const scheduleMidnightRefresh = () => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const msUntilMidnight = tomorrow.getTime() - now.getTime()

            // Schedule refresh at midnight
            const timeoutId = setTimeout(() => {
                console.log('Midnight refresh triggered for school lunch')
                setCurrentDate(new Date())
                fetchLunchMenu()
                // Schedule next midnight refresh
                scheduleMidnightRefresh()
            }, msUntilMidnight)

            return timeoutId
        }

        const timeoutId = scheduleMidnightRefresh()
        return () => clearTimeout(timeoutId)
    }, [])

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <h2 className='text-lg font-bold mb-2'>Today's Lunch</h2>
            {!hasMenu ? (
                <div className="text-center text-gray-400 py-4 text-sm">
                    No school lunch today
                </div>
            ) : (
                <div className="space-y-2">
                    {lunchItems.map((categoryGroup, index) => (
                        <div key={index} className="bg-white/5 rounded p-2 border border-white/10">
                            <h3 className='text-sm font-semibold mb-1 text-blue-300'>
                                {categoryGroup.category}
                            </h3>
                            <ul className='text-xs space-y-1'>
                                {categoryGroup.options.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-1">
                                        <span className="text-green-400">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SchoolLunch
