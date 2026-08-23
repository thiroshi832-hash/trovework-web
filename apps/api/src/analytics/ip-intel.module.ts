import { Module } from "@nestjs/common";
import { IpIntelService } from "./ip-intel.service";

/** Shared so both analytics (visitor history) and admin (user IP oversight) can
 *  classify IP addresses through the one best-effort provider. */
@Module({
  providers: [IpIntelService],
  exports: [IpIntelService],
})
export class IpIntelModule {}
