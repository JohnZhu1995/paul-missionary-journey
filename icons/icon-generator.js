// PWA图标生成器
(function() {
  // 定义不同尺寸的图标
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  // 创建图标画布
  function createIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 背景色（羊皮纸色）
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, size, size);
    
    // 边框
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = size * 0.03;
    ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);
    
    // 内部装饰圆
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.35, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = size * 0.02;
    ctx.stroke();
    
    // 十字架
    const crossWidth = size * 0.12;
    const crossLength = size * 0.35;
    const center = size / 2;
    
    ctx.fillStyle = '#8b4513';
    // 竖线
    ctx.fillRect(center - crossWidth / 2, center - crossLength, crossWidth, crossLength * 2);
    // 横线
    ctx.fillRect(center - crossLength / 2, center - crossWidth / 2, crossLength, crossWidth);
    
    // 文字
    ctx.fillStyle = '#5c4033';
    ctx.font = `bold ${size * 0.12}px "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('保罗', center, center + crossLength + size * 0.12);
    
    return canvas;
  }
  
  // 生成并保存所有图标
  function generateIcons() {
    iconSizes.forEach(size => {
      const canvas = createIcon(size);
      const dataUrl = canvas.toDataURL('image/png');
      
      // 保存到localStorage（用于缓存）
      try {
        localStorage.setItem(`paul-icon-${size}`, dataUrl);
      } catch (e) {
        console.log('无法缓存图标');
      }
    });
  }
  
  // 获取图标数据URL
  window.getIconDataUrl = function(size) {
    const cached = localStorage.getItem(`paul-icon-${size}`);
    if (cached) return cached;
    
    const canvas = createIcon(size);
    return canvas.toDataURL('image/png');
  };
  
  // 页面加载完成后生成图标
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateIcons);
  } else {
    generateIcons();
  }
})();
