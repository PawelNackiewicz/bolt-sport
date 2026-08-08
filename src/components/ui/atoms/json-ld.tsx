type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders a schema.org payload as `<script type="application/ld+json">`.
 * CMS copy ends up inside the tag, so `<` is escaped — an article containing
 * a literal `</script>` would otherwise close the tag and inject markup.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
