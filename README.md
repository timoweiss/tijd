# Tijd

Tijd - Simple time tracker

[download from releases](https://github.com/timoweiss/tijd/releases)

![tijd](https://user-images.githubusercontent.com/5221667/30666790-c2904058-9e55-11e7-862b-0639446770f5.gif)
![Tijd](https://user-images.githubusercontent.com/5221667/29753618-7252bca8-8b75-11e7-8256-a3a24b0190b9.png)

# Developing

Currently the project consists of two parts - main and renderer. The dependencies of both need to be installed separately.


```
# ./
npm i
cd ./renderer && npm i
```
### Start the frontend
```
# ./renderer
npm start
```
### Start the election app
```
# ./
npm run dev
```

### Deploy to Github release artifacts
´´´
npm run deploy
```
Builds and deploys a [release artifact](https://github.com/timoweiss/tijd/releases).
Electron-autoUpdater will fetch the newest release automatically when starting the app. 
Ensure you set an env variable [GH_TOKEN](https://github.com/settings/tokens) with a personal access token of a user with write access for this repo.