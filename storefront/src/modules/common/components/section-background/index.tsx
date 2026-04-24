import { SectionMedia } from "@lib/sanity/queries"

const SectionBackground = ({ media }: { media?: SectionMedia | null }) => {
  if (!media || media.mediaType === "none") return null

  const opacity = (media.overlayOpacity ?? 60) / 100

  return (
    <>
      {media.mediaType === "image" && media.image?.asset?.url && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${media.image.asset.url})` }}
        />
      )}

      {media.mediaType === "video" && media.videoUrl && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={media.videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* Overlay */}
      {opacity > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity }}
        />
      )}
    </>
  )
}

export default SectionBackground
