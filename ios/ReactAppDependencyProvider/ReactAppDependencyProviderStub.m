
mkdir -p ios/ReactAppDependencyProvider
cat > ios/ReactAppDependencyProvider/ReactAppDependencyProviderStub.m <<'EOF'
#import <Foundation/Foundation.h>

// Minimal stub so CocoaPods can build a static target.
// Expo Dev Launcher only needs the symbol to exist.
@interface ReactAppDependencyProviderStub : NSObject
@end

@implementation ReactAppDependencyProviderStub
@end
