# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-11-23

### Added

- Initial release
- 3D tube visualization with Three.js
- Interactive tube manipulation (drag, rotate, position)
- Support for rectangular and square tubes
- Customizable tube parameters (width, height, thickness, length)
- Joint angle controls with snap-to angles (30°, 45°, 90°, 135°)
- Wireframe and solid view toggle
- Undo/Redo functionality with full history
- Multi-tube assembly support
- Camera controls (pan, zoom, rotate)
- Tube selection and deletion
- Electron desktop application packaging
- Cross-platform builds (Windows, macOS, Linux)

### Features

- feat: add tube creation with customizable dimensions
- feat: implement 3D workspace with Three.js
- feat: add drag-and-drop tube positioning
- feat: implement camera controls (pan, zoom, rotate)
- feat: add joint angle snapping
- feat: implement undo/redo system
- feat: add wireframe view toggle
- feat: implement tube rotation controls
- feat: add tube selection and deletion
- feat: create responsive UI with Tailwind CSS
- feat: package as Electron desktop app

```

### 9. **.gitignore**
```

# Dependencies

node_modules/

# Production

build/
dist/

# Misc

.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log\*

# Electron

electron-builder.yml
