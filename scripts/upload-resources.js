/**
 * 资源图片上传脚本
 * 
 * 功能：
 * 1. 扫描 img/resources 目录下的所有图片
 * 2. 上传到云存储
 * 3. 生成数据库导入 JSON 文件
 * 
 * 使用方法：
 * node scripts/upload-resources.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 云环境 ID（请替换为你的实际环境 ID）
  envId: 'cloud1-0gjlge12c7ab5467',
  
  // 本地图片目录
  localDir: path.join(__dirname, '../img/resources'),
  
  // 云存储路径前缀
  cloudPathPrefix: 'resources',
  
  // 输出的数据库导入文件
  outputFile: path.join(__dirname, '../resource_images_import.json')
};

// 资源类型映射
const RESOURCE_MAP = {
  'hairs/man': { type: 'hairs', tag: 'nan', namePrefix: '男士发型' },
  'hairs/woman': { type: 'hairs', tag: 'nv', namePrefix: '女士发型' },
  'clothes/man': { type: 'clothes', tag: 'nan', namePrefix: '男士服装' },
  'clothes/woman': { type: 'clothes', tag: 'nv', namePrefix: '女士服装' },
  'clothes/other': { type: 'clothes', tag: 'other', namePrefix: '通用服装' }
};

/**
 * 扫描目录获取所有图片文件
 */
function scanImages() {
  const images = [];
  
  for (const [dirPath, config] of Object.entries(RESOURCE_MAP)) {
    const fullPath = path.join(CONFIG.localDir, dirPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  目录不存在: ${dirPath}`);
      continue;
    }
    
    const files = fs.readdirSync(fullPath);
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));
    
    console.log(`📁 ${dirPath}: 找到 ${pngFiles.length} 个图片`);
    
    pngFiles.forEach((file, index) => {
      images.push({
        localPath: path.join(fullPath, file),
        cloudPath: `${CONFIG.cloudPathPrefix}/${dirPath}/${file}`,
        type: config.type,
        tag: config.tag,
        name: `${config.namePrefix}${index + 1}`,
        fileName: file
      });
    });
  }
  
  return images;
}

/**
 * 生成云存储 fileID
 */
function generateFileID(cloudPath) {
  // 格式: cloud://环境ID.xxxx-环境ID-随机数/路径
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return `cloud://${CONFIG.envId}.636c-${CONFIG.envId}-${randomSuffix}/${cloudPath}`;
}

/**
 * 生成数据库导入 JSON
 */
function generateImportJSON(images) {
  const records = images.map(img => ({
    type: img.type,
    tag: img.tag,
    url: generateFileID(img.cloudPath),
    name: img.name,
    _comment: `本地文件: ${img.fileName}`
  }));
  
  return records;
}

/**
 * 生成上传指南
 */
function generateUploadGuide(images) {
  let guide = '\n='.repeat(60) + '\n';
  guide += '📋 图片上传指南\n';
  guide += '='.repeat(60) + '\n\n';
  
  guide += '由于脚本无法直接上传到云存储，请按以下步骤手动上传：\n\n';
  
  guide += '步骤 1: 打开微信开发者工具\n';
  guide += '步骤 2: 点击顶部"云开发"按钮\n';
  guide += '步骤 3: 进入"存储"标签\n';
  guide += '步骤 4: 按照以下结构创建文件夹并上传图片：\n\n';
  
  const groupedImages = {};
  images.forEach(img => {
    const dir = path.dirname(img.cloudPath);
    if (!groupedImages[dir]) {
      groupedImages[dir] = [];
    }
    groupedImages[dir].push(img);
  });
  
  for (const [dir, imgs] of Object.entries(groupedImages)) {
    guide += `📂 ${dir}/\n`;
    imgs.forEach(img => {
      guide += `   ├─ ${img.fileName}\n`;
    });
    guide += '\n';
  }
  
  guide += '步骤 5: 上传完成后，复制每个文件的 fileID\n';
  guide += '步骤 6: 修改生成的 resource_images_import.json 文件\n';
  guide += '步骤 7: 将 url 字段替换为实际的 fileID\n';
  guide += '步骤 8: 在数据库控制台导入 JSON 文件\n\n';
  
  guide += '='.repeat(60) + '\n';
  
  return guide;
}

/**
 * 生成快速上传脚本（使用云开发 CLI）
 */
function generateCLIScript(images) {
  let script = '#!/bin/bash\n\n';
  script += '# 使用云开发 CLI 批量上传图片\n';
  script += '# 前提：已安装 @cloudbase/cli 并完成登录\n\n';
  script += `# 安装 CLI: npm install -g @cloudbase/cli\n`;
  script += `# 登录: cloudbase login\n\n`;
  
  const groupedImages = {};
  images.forEach(img => {
    const dir = path.dirname(img.cloudPath);
    if (!groupedImages[dir]) {
      groupedImages[dir] = [];
    }
    groupedImages[dir].push(img);
  });
  
  for (const [dir, imgs] of Object.entries(groupedImages)) {
    script += `echo "上传 ${dir}..."\n`;
    imgs.forEach(img => {
      const localPath = path.relative(process.cwd(), img.localPath);
      script += `cloudbase storage upload ${localPath} ${img.cloudPath} -e ${CONFIG.envId}\n`;
    });
    script += '\n';
  }
  
  script += 'echo "上传完成！"\n';
  
  return script;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始扫描图片资源...\n');
  
  // 扫描图片
  const images = scanImages();
  
  if (images.length === 0) {
    console.log('\n❌ 没有找到任何图片文件！');
    console.log('请将图片放入 img/resources 目录下的对应文件夹中。');
    console.log('详细说明请查看 img/README.md\n');
    return;
  }
  
  console.log(`\n✅ 共找到 ${images.length} 个图片文件\n`);
  
  // 生成数据库导入 JSON
  const importData = generateImportJSON(images);
  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify(importData, null, 2),
    'utf-8'
  );
  console.log(`✅ 已生成数据库导入文件: ${CONFIG.outputFile}\n`);
  
  // 生成上传指南
  const guide = generateUploadGuide(images);
  console.log(guide);
  
  // 生成 CLI 上传脚本
  const cliScript = generateCLIScript(images);
  const cliScriptPath = path.join(__dirname, 'upload-to-cloud.sh');
  fs.writeFileSync(cliScriptPath, cliScript, 'utf-8');
  fs.chmodSync(cliScriptPath, '755');
  console.log(`✅ 已生成 CLI 上传脚本: ${cliScriptPath}\n`);
  
  // 统计信息
  console.log('📊 统计信息：');
  const stats = {};
  images.forEach(img => {
    const key = `${img.type}-${img.tag}`;
    stats[key] = (stats[key] || 0) + 1;
  });
  
  console.log(`   男士发型: ${stats['hairs-nan'] || 0} 张`);
  console.log(`   女士发型: ${stats['hairs-nv'] || 0} 张`);
  console.log(`   男士服装: ${stats['clothes-nan'] || 0} 张`);
  console.log(`   女士服装: ${stats['clothes-nv'] || 0} 张`);
  console.log(`   通用服装: ${stats['clothes-other'] || 0} 张`);
  console.log(`   总计: ${images.length} 张\n`);
  
  // 提示
  console.log('📝 下一步操作：');
  console.log('   1. 按照上述指南手动上传图片到云存储');
  console.log('   2. 或使用 CLI 脚本自动上传: ./scripts/upload-to-cloud.sh');
  console.log('   3. 修改 resource_images_import.json 中的 url 为实际 fileID');
  console.log('   4. 在云开发控制台导入 JSON 文件到 resource-images 集合\n');
}

// 运行
main();

