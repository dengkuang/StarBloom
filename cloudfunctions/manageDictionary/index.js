// 字典管理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, category, data } = event

  try {
    switch (action) {
      case 'getByCategory':
        return await getByCategory(category)
      case 'getAllCategories':
        return await getAllCategories()
      case 'batchGet':
        return await batchGet(event.categories)
      case 'add':
        return await addDictionary(data)
      case 'update':
        return await updateDictionary(event.id, data)
      case 'delete':
        return await deleteDictionary(event.id)
      default:
        return { code: -1, message: '不支持的操作' }
    }
  } catch (error) {
    console.error('字典管理操作失败:', error)
    return { code: -1, message: error.message }
  }
}

// 根据分类获取字典项
async function getByCategory(category) {
  if (!category) {
    return { code: -1, message: '分类参数不能为空' }
  }

  const result = await db.collection('dictionaries')
    .where({ category })
    .orderBy('code', 'asc')
    .get()

  return {
    code: 0,
    data: result.data,
    message: '获取成功'
  }
}

// 获取所有分类
async function getAllCategories() {
  const result = await db.collection('dictionaries')
    .aggregate()
    .group({
      _id: '$category',
      count: db.command.aggregate.sum(1)
    })
    .end()

  return {
    code: 0,
    data: result.list.map(item => ({
      category: item._id,
      count: item.count
    })),
    message: '获取成功'
  }
}

// 批量获取多个分类的字典项
async function batchGet(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { code: -1, message: '分类列表不能为空' }
  }

  const result = await db.collection('dictionaries')
    .where({
      category: db.command.in(categories)
    })
    .orderBy('category', 'asc')
    .orderBy('code', 'asc')
    .get()

  // 按分类分组
  const groupedData = {}
  result.data.forEach(item => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = []
    }
    groupedData[item.category].push(item)
  })

  return {
    code: 0,
    data: groupedData,
    message: '获取成功'
  }
}

// 添加字典项
async function addDictionary(data) {
  const { category, code, name, value, sort_order = 0 } = data

  if (!category || !code || !name) {
    return { code: -1, message: '分类、代码和名称不能为空' }
  }

  // 检查是否已存在
  const existResult = await db.collection('dictionaries')
    .where({ category, code })
    .get()

  if (existResult.data.length > 0) {
    return { code: -1, message: '该分类下已存在相同代码的字典项' }
  }

  const result = await db.collection('dictionaries').add({
    data: {
      category,
      code,
      name,
      value: value || code,
      sort_order,
      createTime: new Date(),
      updateTime: new Date()
    }
  })

  return {
    code: 0,
    data: { _id: result._id },
    message: '添加成功'
  }
}

// 更新字典项
async function updateDictionary(id, data) {
  if (!id) {
    return { code: -1, message: 'ID不能为空' }
  }

  const updateData = {
    ...data,
    updateTime: new Date()
  }

  const result = await db.collection('dictionaries')
    .doc(id)
    .update({
      data: updateData
    })

  return {
    code: 0,
    data: result,
    message: '更新成功'
  }
}

// 删除字典项
async function deleteDictionary(id) {
  if (!id) {
    return { code: -1, message: 'ID不能为空' }
  }

  const result = await db.collection('dictionaries')
    .doc(id)
    .remove()

  return {
    code: 0,
    data: result,
    message: '删除成功'
  }
}