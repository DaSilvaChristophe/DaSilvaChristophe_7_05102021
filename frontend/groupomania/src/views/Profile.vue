<template>
	<div>
		<Nav/>
		<Profile/>
	</div>
</template>

<script>

import Nav from '../components/Nav/Nav.vue'
import Profile from '../components/Profile.vue'

export default {
	name: 'Home',
	
	components: {
		Profile, Nav
	},
};

</script>