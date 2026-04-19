const vscode = require('vscode');

// 预设字号配置（可自行修改）
const FONT_CONFIG = {
  small: 14,   // 小字=默认字号
  middle: 22,  // 中字
  large: 36    // 大字
};

/**
 * 插件激活入口
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // 获取全局配置
  const config = vscode.workspace.getConfiguration('editor');

  // 1. 创建右下角状态栏按钮
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(settings) 设置字号';
  statusBarItem.tooltip = '左键：打开设置面板 | 右键：快速切换字号';
  statusBarItem.show();

  // 2. 注册状态栏按钮左键点击事件（打开侧边面板）
  const openPanelCommand = vscode.commands.registerCommand(
    'font-size-controller.openSettingPanel',
    () => showFontSettingPanel()
  );
  statusBarItem.command = 'font-size-controller.openSettingPanel';

  // 3. 注册状态栏按钮右键菜单事件
  statusBarItem.onDidClick(async (event) => {
    if (event.button === 2) { // 右键点击
      const selection = await vscode.window.showQuickPick([
        { label: '🔴 大字', value: 'large' },
        { label: '🟡 中字', value: 'middle' },
        { label: '🟢 小字（默认）', value: 'small' }
      ], { placeHolder: '快速选择字号档位' });

      if (selection) {
        setFontSize(FONT_CONFIG[selection.value]);
      }
    }
  });

  // 4. 注册三档字号快捷命令
  const smallFontCmd = vscode.commands.registerCommand(
    'font-size-controller.setSmallFont',
    () => setFontSize(FONT_CONFIG.small)
  );
  const middleFontCmd = vscode.commands.registerCommand(
    'font-size-controller.setMiddleFont',
    () => setFontSize(FONT_CONFIG.middle)
  );
  const largeFontCmd = vscode.commands.registerCommand(
    'font-size-controller.setLargeFont',
    () => setFontSize(FONT_CONFIG.large)
  );

  // 5. 注册所有命令到上下文
  context.subscriptions.push(
    statusBarItem,
    openPanelCommand,
    smallFontCmd,
    middleFontCmd,
    largeFontCmd
  );
}

/**
 * 显示字体设置侧边面板
 */
function showFontSettingPanel() {
  const config = vscode.workspace.getConfiguration('editor');
  const currentSize = config.get('fontSize');

  // 创建webview面板
  const panel = vscode.window.createWebviewPanel(
    'fontSizeSetting',
    '字体大小设置',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // 面板HTML内容
  panel.webview.html = getWebviewContent(currentSize);

  // 监听webview消息
  panel.webview.onDidReceiveMessage(async (message) => {
    switch (message.command) {
      case 'setSize':
        setFontSize(message.size);
        break;
      case 'resetSize':
        setFontSize(FONT_CONFIG.small);
        break;
      case 'setPreset':
        setFontSize(FONT_CONFIG[message.type]);
        break;
    }
  });
}

/**
 * 设置编辑器字号
 * @param {number} size 字号大小
 */
function setFontSize(size) {
  if (!size || isNaN(size) || size < 8 || size > 100) {
    vscode.window.showErrorMessage('字号必须在 8-100 之间！');
    return;
  }

  const config = vscode.workspace.getConfiguration('editor');
  config.update('fontSize', size, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(`已设置字号为：${size}px`);
}

/**
 * 生成webview面板HTML
 * @param {number} currentSize 当前字号
 * @returns {string} HTML字符串
 */
function getWebviewContent(currentSize) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1e1e1e;
      color: #fff;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
    }
    .title {
      font-size: 18px;
      margin-bottom: 20px;
      color: #00d0ff;
    }
    .size-display {
      font-size: 24px;
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      background: #2d2d30;
      border-radius: 6px;
    }
    .slider {
      width: 100%;
      height: 6px;
      margin: 20px 0;
      accent-color: #00d0ff;
    }
    .btn-group {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin: 15px 0;
    }
    .btn {
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: 0.2s;
    }
    .btn-small { background: #28a745; color: white; }
    .btn-middle { background: #ffc107; color: #000; }
    .btn-large { background: #dc3545; color: white; }
    .btn-reset {
      width: 100%;
      padding: 12px;
      background: #6c757d;
      color: white;
      margin-top: 10px;
    }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">📝 代码编辑区字号设置</div>
    <div class="size-display">当前字号：<span id="currentSize">${currentSize}</span>px</div>
    
    <input type="range" id="slider" class="slider" min="8" max="100" value="${currentSize}">
    
    <div class="btn-group">
      <button class="btn btn-small" onclick="setPreset('small')">🟢 小字（默认）</button>
      <button class="btn btn-middle" onclick="setPreset('middle')">🟡 中字</button>
      <button class="btn btn-large" onclick="setPreset('large')">🔴 大字</button>
    </div>
    
    <button class="btn btn-reset" onclick="resetSize()">🔄 恢复默认字号</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const slider = document.getElementById('slider');
    const sizeText = document.getElementById('currentSize');
    
    // 滑动条实时更新
    slider.addEventListener('input', () => {
      const size = slider.value;
      sizeText.textContent = size;
      vscode.postMessage({ command: 'setSize', size: Number(size) });
    });
    
    // 预设字号
    function setPreset(type) {
      vscode.postMessage({ command: 'setPreset', type });
      setTimeout(() => {
        slider.value = type === 'small' ? 14 : type === 'middle' ? 18 : 22;
        sizeText.textContent = slider.value;
      }, 100);
    }
    
    // 恢复默认
    function resetSize() {
      vscode.postMessage({ command: 'resetSize' });
      setTimeout(() => {
        slider.value = 14;
        sizeText.textContent = 14;
      }, 100);
    }
  </script>
</body>
</html>
  `;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};