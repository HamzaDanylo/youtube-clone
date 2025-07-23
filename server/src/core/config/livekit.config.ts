import { TypeLiveKitOptions } from "@/src/modules/libs/livekit/types/livekit.types";
import { ConfigService } from "@nestjs/config";

export function getLiveKitConfig (configService: ConfigService): TypeLiveKitOptions {
    return {
        apiUrl: configService.getOrThrow<string>('LIVEKIT_API_URL'),
        apiKey: configService.getOrThrow<string>('LIVEKIT_API_KEY'),
        apiSecret: configService.getOrThrow<string>('LIVEKIT_API_SECRET')
    }
}