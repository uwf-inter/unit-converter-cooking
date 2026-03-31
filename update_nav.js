const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newNavHtml = `
    <!-- ========== New Slim Navigation ========== -->
    <header class="app-header" id="app-header">
        <div class="header-top">
            <h1 class="logo"><a href="index.html" class="spa-link" style="text-decoration:none; color:inherit;">👨‍🍳 お料理単位くん</a></h1>
            
            <div class="category-select-wrapper">
                <select id="mobile-category-select" class="category-select" aria-label="ツールカテゴリ選択">
                    <option value="index.html">🍲 単位・g換算</option>
                    <option value="baking-calc.html">🍰 ケーキ型換算</option>
                    <option value="microwave-calc.html">⚡ レンジ換算</option>
                    <option value="fitness-calc.html">🏃 フィットネス計量</option>
                    <option value="standard-weights.html">🥦 野菜の重量</option>
                    <option value="substitute-measuring.html">⚖️ 代用・目分量</option>
                    <option value="global-matrix.html">🌍 海外換算</option>
                </select>
            </div>
        </div>
        
        <nav class="chip-nav-container">
            <ul class="chip-nav" id="chip-nav">
                <li><a href="index.html" class="chip-link spa-link">基本変換</a></li>
                <li><a href="butter.html" class="chip-link spa-link">バター</a></li>
                <li><a href="sugar.html" class="chip-link spa-link">砂糖</a></li>
                <li><a href="flour.html" class="chip-link spa-link">小麦粉</a></li>
                <li><a href="salt.html" class="chip-link spa-link">塩</a></li>
                <li><a href="otama.html" class="chip-link spa-link">おたま</a></li>
                <li><a href="tube-spices.html" class="chip-link spa-link">チューブ調味料</a></li>
                <li><a href="pasta-calc.html" class="chip-link spa-link">パスタ</a></li>
                <li><a href="rice-calc.html" class="chip-link spa-link">お米</a></li>
                <li><a href="visual-guide.html" class="chip-link spa-link">目分量ガイド</a></li>
                <li><a href="no-scale-measuring.html" class="chip-link spa-link">はかりなし</a></li>
                <li><a href="1-stick-butter.html" class="chip-link spa-link">バター1 stick</a></li>
            </ul>
        </nav>
    </header>
    <!-- ========================================== -->
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Replace everything from <header> up to <nav class="breadcrumb"> or <main class="container">
    const headerRegex = /<header>[\s\S]*?(?=<nav class="breadcrumb">|<main class="container">|<main>)/i;
    
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, newNavHtml + '\n    ');
        fs.writeFileSync(path.join(dir, file), content);
        console.log("Updated navigation for: " + file);
    } else {
        console.log("Skipped (Regex no match): " + file);
    }
});
