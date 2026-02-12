# PWA 快速部署检查清单

## ⚡ 5分钟快速部署

### 第1步：准备文件
确保你有以下文件：
```
保罗宣教之旅/
├── index.html
├── styles.css
├── data.js
├── game.js
├── manifest.json
├── service-worker.js
├── icons/
│   ├── icon-generator.js
│   └── generate-icons.html
├── DEPLOY.md
└── README.md
```

### 第2步：部署到服务器（任选其一）

#### 方案A：GitHub Pages（免费）
1. 在GitHub创建新仓库
2. 上传所有文件
3. Settings → Pages → Source → main
4. 等待1分钟，访问 `https://你的用户名.github.io/仓库名`

#### 方案B：Netlify（免费）
1. 访问 https://app.netlify.com/drop
2. 将整个项目文件夹拖拽到网页上
3. 立即获得一个网址（如 https://paul-journey-abc123.netlify.app）

#### 方案C：本地测试
```bash
# 安装Node.js后运行
npx serve 保罗宣教之旅

# 或Python
python -m http.server 8000 --directory 保罗宣教之旅
```

### 第3步：生成图标
1. 访问 `你的网址/icons/generate-icons.html`
2. 点击"生成图标"
3. 右键保存所有8个图标到 `icons/` 文件夹
4. 重新部署

### 第4步：测试PWA
打开Chrome开发者工具 → Lighthouse → 勾选"PWA" → Generate report

合格标准：
- ✅ 可安装
- ✅ 有Service Worker
- ✅ 有Manifest
- ✅ 可离线工作

### 第5步：添加到手机
- **Android Chrome**: 菜单 → "添加到主屏幕"
- **iOS Safari**: 分享按钮 → "添加到主屏幕"

---

## 🔍 常见问题速查

### 图标不显示？
- 确保图标文件在 `icons/` 文件夹
- 文件名必须是 `icon-72x72.png` 等格式
- 检查 manifest.json 中的路径是否正确

### 无法离线玩？
- 首次必须在联网状态下打开游戏
- 检查控制台是否有Service Worker错误
- 清除缓存后重新加载

### 无法安装？
- 必须使用HTTPS（GitHub Pages/Netlify自带）
- 检查manifest.json是否可访问
- iOS必须使用Safari浏览器

---

## ✅ 部署成功标志

- [ ] 网站可以通过HTTPS访问
- [ ] 浏览器地址栏出现"安装"图标（Chrome/Edge）
- [ ] 手机可以"添加到主屏幕"
- [ ] 断网后可以正常游戏
- [ ] 打开是独立窗口（无地址栏）

**🎉 恭喜！你的PWA游戏已部署成功！**
