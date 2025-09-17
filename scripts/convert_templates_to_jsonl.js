const fs = require('fs');
const path = require('path');

// 要处理的文件列表
const files = [
  'templates/reward_templates_3_6_years.json',
  'templates/reward_templates_6_9_years.json',
  'templates/task_templates_3_6_years.json',
  'templates/task_templates_6_9_years.json'
];

// 确保输出目录存在
const outputDir = path.join(__dirname, '../templates/jsonl');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 处理每个文件
files.forEach(filePath => {
  try {
    // 读取文件内容
    const fullPath = path.join(__dirname, '..', filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    
    // 解析JSON数组
    const templates = JSON.parse(fileContent);
    
    // 获取文件名（不含扩展名）
    const fileName = path.basename(filePath, '.json');
    
    // 为每个模板创建单独的文件
    templates.forEach(template => {
      // 使用templateId作为_id
      template._id = template.templateId;
      
      // 创建文件名
      const outputFileName = `${template.templateId}.json`;
      const outputPath = path.join(outputDir, outputFileName);
      
      // 写入文件
      fs.writeFileSync(outputPath, JSON.stringify(template), 'utf8');
      console.log(`Created: ${outputPath}`);
    });
    
    // 创建一个包含所有模板的JSONL文件（每行一个JSON对象）
    const jsonlContent = templates.map(template => {
      // 添加_id字段
      template._id = template.templateId;
      return JSON.stringify(template);
    }).join('\n');
    
    const jsonlPath = path.join(outputDir, `${fileName}.jsonl`);
    fs.writeFileSync(jsonlPath, jsonlContent, 'utf8');
    console.log(`Created JSONL file: ${jsonlPath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('Conversion completed!');