<template>
  <TScrollContainer>
    <ul>
      <li>švestka</li>
      <li>jablko</li>
      <li>třešeň</li>
      <li>hruška</li>
      <li>slivovice</li>
      <li>hruškovice</li>
      <li>calvados</li>
      <li>jahoda</li>
      <li>malina</li>
      <li>jahodovice</li>
      <li>avocado</li>
      <li>kiwi</li>
      <li>avocadovice</li>
      <li>pomeranč</li>
      <li>mandarinečka</li>
      <li>pomelo</li>
      <li>pomelovice</li>
    </ul>
  </TScrollContainer>
</template>

<script>
import TScrollContainer from '@/components/tscrollcontainer/TScrollContainer.vue'
export default {
  components: { TScrollContainer }
}

</script>

<style scoped>
ul {
  list-style-type: none;
}
</style>