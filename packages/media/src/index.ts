import { createHash, randomUUID } from 'node:crypto';

/** The actor must be constructed by trusted server-side authentication and authorization. */
export type MediaActor = Readonly<{ companyId: string; branchId: string; permissions: readonly string[] }>;
export type MediaKind = 'image' | 'document';
export type DetectedMime = 'image/jpeg' | 'image/png' | 'application/pdf';
export type ScanResult = 'clean' | 'infected';
export interface MalwareScanner { scan(contents: Buffer): Promise<ScanResult>; }
export interface PrivateMediaStorage {
  put(input: Readonly<{ key: string; mime: DetectedMime; contents: Buffer }>): Promise<void>;
}
export type MediaStores = Readonly<{ cloudflareImages: PrivateMediaStorage; supabaseS3: PrivateMediaStorage }>;
export type UploadReceipt = Readonly<{ key: string; kind: MediaKind; mime: DetectedMime; sha256: string; bytes: number }>;
export class MediaRejectedError extends Error {}
export class ScannerUnavailableError extends Error {}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxBytes = 10 * 1024 * 1024;
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function detectMime(data: Buffer): DetectedMime | undefined {
  if (data.length >= 8 && data.subarray(0, 8).equals(png)) return 'image/png';
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data.length >= 5 && data.subarray(0, 5).equals(Buffer.from('%PDF-'))) return 'application/pdf';
  return undefined;
}

export class UploadMediaCommand {
  constructor(readonly actor: MediaActor, readonly kind: MediaKind, readonly declaredMime: string, readonly contents: Buffer) {}
}

/** Orchestration only: no HTTP endpoint, production providers or ClamAV adapter are configured. */
export class UploadMediaHandler {
  constructor(private readonly scanner: MalwareScanner, private readonly stores: MediaStores) {}

  async execute(command: UploadMediaCommand): Promise<UploadReceipt> {
    if (!command.actor.permissions.includes('media.upload') || !uuid.test(command.actor.companyId) || !uuid.test(command.actor.branchId)) throw new MediaRejectedError('Forbidden');
    if (!Buffer.isBuffer(command.contents) || command.contents.length === 0 || command.contents.length > maxBytes) throw new MediaRejectedError('Invalid file size');
    // Own a snapshot so the caller cannot swap bytes between scanning and storage.
    const contents = Buffer.from(command.contents);
    const mime = detectMime(contents);
    if (!mime || mime !== command.declaredMime || (command.kind === 'image' && !mime.startsWith('image/')) || (command.kind === 'document' && mime !== 'application/pdf') || !['image', 'document'].includes(command.kind)) throw new MediaRejectedError('Unsupported file type');
    let verdict: ScanResult;
    try { verdict = await this.scanner.scan(Buffer.from(contents)); } catch { throw new ScannerUnavailableError('Malware scanner unavailable'); }
    if (verdict !== 'clean') throw new MediaRejectedError('File rejected by malware scanner');
    const key = `${command.actor.companyId}/${command.actor.branchId}/${randomUUID()}`;
    const sha256 = createHash('sha256').update(contents).digest('hex');
    const store = command.kind === 'image' ? this.stores.cloudflareImages : this.stores.supabaseS3;
    await store.put({ key, mime, contents });
    return { key, kind: command.kind, mime, sha256, bytes: contents.length };
  }
}
