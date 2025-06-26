<script>
	const { url, title, className = '' } = $props();
</script>

<a href={url} class={className}>{title}</a>
