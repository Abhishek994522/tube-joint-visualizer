# 🧩 Tube Joint Visualizer

An interactive 3D desktop application for creating, visualizing, and manipulating joints between rectangular and square tubes at various angles.

![Tube Joint Visualizer](assets/screenshot.png)

## ✨ Features

- **Interactive 3D Workspace**: Drag, rotate, and position tubes in real-time
- **Multiple Tube Types**: Support for rectangular and square tubes
- **Customizable Parameters**: Adjust width, height, thickness, and length
- **Joint Angles**: Snap to standard angles (30°, 45°, 90°, 135°) or use custom angles
- **Visualization Modes**: Toggle between wireframe and solid views
- **Undo/Redo**: Full history tracking for all operations
- **Multi-tube Assembly**: Add multiple tubes to create complex assemblies
- **Intuitive Controls**: Mouse-based navigation with zoom, pan, and rotate

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tube-joint-visualizer.git
cd tube-joint-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development version:
```bash
npm run electron-dev
```

## 📦 Building the Application

### Build for your platform:
```bash
npm run build:electron
```

This will create a standalone executable in the `dist/` folder.

### Platform-specific builds:

- **Windows**: Creates `.exe` installer in `dist/`
- **macOS**: Creates `.dmg` file in `dist/`
- **Linux**: Creates `.AppImage` in `dist/`

## 🎮 Controls

- **Left Click + Drag**: Move selected tube
- **Right Click + Drag**: Rotate camera view
- **Middle Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Sidebar Controls**: Select, rotate, and delete tubes

## 📂 Project Structure
```
tube-joint-visualizer/
├── electron/
│   └── main.js              # Electron main process
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── App.js              # Main app component
│   ├── index.js            # React entry point
│   └── TubeJointVisualizer.js  # Main visualization component
├── assets/
│   ├── icon.png            # Application icon
│   └── screenshot.png      # Demo screenshot
├── package.json            # Project configuration
└── README.md              # This file
```

## 🛠️ Technologies Used

- **React**: UI framework
- **Three.js**: 3D graphics library
- **Electron**: Desktop application framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

## 📝 Development Workflow

All commits follow conventional commit messages:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `refactor:` Code refactoring
- `style:` UI/styling changes

## 🐛 Troubleshooting

### Application won't start
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npm cache clean --force`
- Rebuild: `npm run build`

### 3D rendering issues
- Update your graphics drivers
- Ensure WebGL is enabled in your browser/Electron

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

[Your Name]

## 🙏 Acknowledgments

- Three.js community for excellent 3D graphics library
- React team for the robust UI framework
- Electron team for enabling desktop applications