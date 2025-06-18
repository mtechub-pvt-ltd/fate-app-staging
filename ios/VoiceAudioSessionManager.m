#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VoiceAudioSessionManager, NSObject)

RCT_EXTERN_METHOD(setupSession:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(resetSession:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkMicrophoneAvailability:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject)

@end
