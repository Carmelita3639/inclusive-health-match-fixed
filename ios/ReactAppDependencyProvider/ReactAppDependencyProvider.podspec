Pod::Spec.new do |s|
  s.name         = 'ReactAppDependencyProvider'
  s.version      = '0.0.1'
  s.summary      = 'Stub provider required by expo-dev-launcher on RN 0.76'
  s.homepage     = 'https://reactnative.dev'
  s.license      = { :type => 'MIT' }
  s.authors      = { 'Meta Open Source' => 'opensource@meta.com' }
  s.platform     = :ios, '13.4'

  # A valid Git URL to satisfy CocoaPods validation.
  s.source       = { :git => 'https://github.com/facebook/react-native.git' }

  s.requires_arc = true
  # Use the vendored stub we placed in ios/ReactAppDependencyProvider
  s.source_files = 'ReactAppDependencyProvider/*.{h,m,mm,swift}'
end
