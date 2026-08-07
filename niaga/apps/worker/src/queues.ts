/**
 * The full job registry, declared in one place.
 *
 * The queue is pg-boss — Postgres-backed, so enqueueing is transactional with
 * the write that caused it and there is no broker to run. No RabbitMQ (nothing
 * here needs AMQP semantics) and no Redis-backed queue (Redis is only for rate
 * limiting). BullMQ is the swap-out if throughput ever demands it.
 *
 * Queues without a handler yet are still created at boot, so producers written
 * in a later phase can enqueue before their consumer exists.
 */
export const QUEUES = {
  /** sharp → webp at 3 sizes, then write listing_media rows. Phase 2. */
  imageDerivatives: 'image.derivatives',
  /** Resend notification when an inquiry arrives. Phase 4. */
  inquiryNotify: 'inquiry.notify',
  /** Flip active listings past expires_at to 'expired'. Implemented. */
  listingExpirySweep: 'listing.expiry-sweep',
  /** Digest matches for saved searches. Phase 6. */
  savedSearchDigest: 'saved-search.digest',
  /** OCR verification documents to pre-fill the review queue. Later. */
  documentOcr: 'document.ocr',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const ALL_QUEUES: QueueName[] = Object.values(QUEUES);
