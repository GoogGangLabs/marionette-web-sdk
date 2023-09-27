import { Constraint, Sleep } from "./constant";
import { EventState, GuardFlag } from "./enum";
import { RTCPeerClient } from "./peer.client";
import { ErrorFactory, ClassBinding, GuardFactory } from "./decorator";
import { Request } from "./request";
import * as MarionetteType from "./types";

@ClassBinding
export class MarionetteClient {
  private streamConfig: MarionetteType.StreamConfigurations = {};

  protected streamClient = new RTCPeerClient("stream");
  protected dataClient = new RTCPeerClient("data");
  protected metadataClient = new RTCPeerClient("metadata");

  protected roomId: string = undefined;
  protected sessionId: string = undefined;
  protected nickname: string = undefined;

  constructor(config: MarionetteType.MarionetteConfigurations) {
    Constraint.token = config.token;
    this.roomId = config.roomId || "anonymous room";
    this.nickname = config.nickname || "anonymous user";

    this.streamConfig.deviceId = "";
    this.streamConfig.width = 320;
    this.streamConfig.height = 240;
    this.streamConfig.frameRate = 30;
  }

  /* ========================================== */
  /*                Public Method               */
  /* ========================================== */

  public on = (name: EventState, listener: (...args: any[]) => void) => Constraint.event.on(name, listener);

  @ErrorFactory()
  public async init(): Promise<void> {
    await this.initICECredential();
    await this.streamClient.init();
    await this.dataClient.init();
    await this.metadataClient.init();
  }

  @GuardFactory(GuardFlag.INIT)
  @ErrorFactory()
  public async release() {
    this.streamClient.release();
    this.dataClient.release();
    this.metadataClient.release();

    await Request({ host: `${Constraint.host}/session/leave` });
  }

  @GuardFactory(GuardFlag.INIT)
  @ErrorFactory()
  public async loadStream(config?: MarionetteType.StreamConfigurations): Promise<MediaStream> {
    this.setStreamConfiguration(config || {});
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: this.streamConfig.deviceId,
        width: this.streamConfig.width,
        height: this.streamConfig.height,
        frameRate: { ideal: this.streamConfig.frameRate, min: 5 },
      },
    });

    this.streamClient.setStream(stream);
    return stream;
  }

  @GuardFactory(GuardFlag.STREAM)
  @ErrorFactory()
  public async connect() {
    await Promise.all([this.streamClient.setOffer(), this.dataClient.setOffer(), this.metadataClient.setOffer()]);

    const [streamSdp, dataSdp, metadataSdp] = await Promise.all([
      this.streamClient.getOffer(),
      this.dataClient.getOffer(),
      this.metadataClient.getOffer(),
    ]);
    const requestPayload: MarionetteType.SignalingRequest = {
      roomId: this.roomId,
      nickname: this.nickname,
      streamSdp,
      dataSdp,
      metadataSdp,
    };

    const responsePayload: MarionetteType.SignalingResponse = await Request({
      host: `${Constraint.host}/session/join`,
      body: requestPayload,
    });

    await Promise.all([
      this.streamClient.setAnswer(responsePayload.streamSdp),
      this.dataClient.setAnswer(responsePayload.dataSdp),
      this.metadataClient.setAnswer(responsePayload.metadataSdp),
    ]);

    for (let _ = 0; _ < 2000; _++) {
      if (this.streamClient.isConnected() && this.dataClient.isConnected() && this.metadataClient.isConnected()) {
        return;
      }

      await Sleep(10);
    }

    throw new Error("ICE connection failed");
  }

  @GuardFactory(GuardFlag.PEER_CONNECTION)
  @ErrorFactory()
  public async publish() {
    this.streamClient.publish();
    await Request({ host: `${Constraint.host}/session/publish` });
  }

  @GuardFactory(GuardFlag.PEER_CONNECTION)
  @ErrorFactory()
  public async pause() {
    this.streamClient.pause();
  }

  public setRoomId = (roomId: string) => {
    this.roomId = roomId;
  };

  public setNickname = (nickname: string) => {
    this.nickname = nickname;
  };

  @GuardFactory(GuardFlag.INIT)
  public getSessionId() {
    return this.sessionId;
  }

  public getRoomId = () => this.roomId;

  public getNickname = () => this.nickname;

  public getDevices = async () => {
    return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
  };

  @GuardFactory(GuardFlag.STREAM)
  public getStream() {
    return this.streamClient.getStream();
  }

  /* ========================================== */
  /*               Private Method               */
  /* ========================================== */

  private initICECredential = async (): Promise<void> => {
    if (
      !Constraint.iceCredential.username ||
      parseInt(Constraint.iceCredential.username.split(":")[0] + "000") <= Date.now() - 300000
    ) {
      const response = (await Request({
        host: `${Constraint.host}/auth/key/credential`,
      })) as MarionetteType.IceCredentialResponse;

      this.sessionId = response.sessionId;
      Constraint.iceCredential.username = response.username;
      Constraint.iceCredential.credential = response.credential;
      Constraint.iceCredential.iceHost = response.iceHost;
    }
  };

  private setStreamConfiguration = (config: MarionetteType.StreamConfigurations) => {
    this.streamConfig.deviceId = config.deviceId || this.streamConfig.deviceId;
    this.streamConfig.width = config.width || this.streamConfig.width;
    this.streamConfig.height = config.height || this.streamConfig.height;
    this.streamConfig.frameRate = config.frameRate || this.streamConfig.frameRate;
  };
}
