<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
    </div>
    <div class="center">
        <Favorite />
        <Explorer />
        <Info />
    </div>
</template>

<style lang="less" scoped>
.header {
    display: flex;
    height: 60px;
    .title {
        height: 60px;
        line-height: 60px;
        margin: 0;
        padding: 0 20px;
    }
}
.center {
    flex-grow: 1;
    display: flex;
}
</style>
