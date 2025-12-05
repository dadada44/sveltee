<script>
	import './layout.css';
	import Chatbot from '$lib/components/Chatbot.svelte';
	
	let { children } = $props();
</script>

{@render children()}

<Chatbot />
