<template>
    <h1 class="x">hello vite</h1>
    <div>{{message}}</div>
    <input type="text" v-model="message">
</template>
<script>
import { ref } from "vue";
export default {
    name: "app",
    setup() {
        const message = ref('嘻嘻嘻')
        return {message}
    }
}
</script>
<style lang="css" scoped>
    .x {
        color: red
    }
</style>