// scripts/fix-missing-podspec.js
const fs = require('fs');
const path = require('path');

const rnDir = path.join(__dirname, '..', 'node_modules', 'react-native');
const podspecPath = path.join(rnDir, 'ReactAppDependencyProvider.podspec');
const stubDir = path.join(rnDir, 'ReactAppDependencyProvider');
const stubFile = path.join(stubDir, 'ReactAppDependencyProviderStub.m');

if (!fs.existsSync(rnDir)) {
  console.log('[fix-missing-podspec] react-native not found; skipping.');
  process.exit(0);
}

if (!fs.existsSync(stubDir)) fs.mkdirSync(stubDir, { recursive: true });

// Always ensure there is at least one source file for CocoaPods.
if (!fs.existsSync(stubFile)) {
  fs.writeFileSync(
    stubFile,
    `#import <Foundation/Foundation.h>
@interface ReactAppDependencyProviderStub : NSObject @end
@implementation ReactAppDependencyProviderStub @end\n`,
    'utf8'
  );
  console.log('[fix-missing-podspec] Wrote dummy source file');
}

// Write/overwrite a valid podspec with required metadata + sources.
const podspec = `
Pod::Spec.new do |s|
  s.name         = 'ReactAppDependencyProvider'
  s.version      = '0.0.1'
  s.summary      = 'Compatibility pod for Expo Dev Launcher when RN tarball lacks this spec'
  s.homepage     = 'https://reactnative.dev'
  s.license      = { :type => 'MIT' }
  s.authors      = { 'React Native' => 'opensource@fb.com' }
  s.source       = { :git => 'https://github.com/facebook/react-native.git' }
  s.platform     = :ios, '13.4'
  s.source_files = 'ReactAppDependencyProvider/**/*.{h,m,mm,swift}'
end
`.trimStart();

fs.writeFileSync(podspecPath, podspec, 'utf8');
console.log('[fix-missing-podspec] Wrote ReactAppDependencyProvider.podspec');
