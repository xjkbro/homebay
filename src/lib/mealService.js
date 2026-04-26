export async function fetchSchoolMenu(dateString = new Date(), schoolId = null) {
  // Get school ID from parameter, localStorage, or env variable
  const SCHOOL_NAME = schoolId ||
                      (typeof localStorage !== 'undefined' ? localStorage.getItem('schoolId') : null) ||
                      import.meta.env.VITE_MEALVIEWER_SCHOOL_ID || ''

  // Format date as YYYY-MM-DD
  let date
  if (dateString) {
    const [month, day, year] = dateString.split('/')
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  } else {
    date = new Date()
  }

  const formattedDate = date.toISOString().split('T')[0]
  const url = `https://api.mealviewer.com/api/v4/school/${SCHOOL_NAME}/${formattedDate}/${formattedDate}`

  console.log('Fetching from:', url)

  const response = await fetch(url)
  const data = await response.json()

  // Parse the menu data to extract lunch items
  const menuSchedules = data.menuSchedules || []
  const results = []

  for (const schedule of menuSchedules) {
    const menuBlocks = schedule.menuBlocks || []
    const lunchBlock = menuBlocks.find((block) =>
      block.blockName.toLowerCase() === 'lunch'
    )

    if (lunchBlock && lunchBlock.cafeteriaLineList?.data?.[0]?.foodItemList?.data) {
      const foodItems = lunchBlock.cafeteriaLineList.data[0].foodItemList.data

      // Group items by category
      const categoriesMap = new Map()

      for (const food of foodItems) {
        const category = food.item_Type || 'MISCELLANEOUS'
        const itemName = food.item_Name

        // Skip miscellaneous and milk
        if (category === 'MISCELLANEOUS' || category === 'MILK') {
          continue
        }

        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, new Set())
        }
        categoriesMap.get(category).add(itemName)
      }

      // Convert to array format with category objects
      const lunch = Array.from(categoriesMap.entries()).map(([category, itemsSet]) => ({
        category: category,
        options: Array.from(itemsSet)
      }))

      results.push({
        date: schedule.dateInformation?.dateFull || formattedDate,
        lunch: lunch
      })
    }
  }

  return results
}
