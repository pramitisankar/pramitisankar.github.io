let currentScene = 0;
let scenes = [];

function chart(parameters) {
    d3.select('#visualization').html('');
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 800)
        .append('g')
        .attr('transform', 'translate(50, 50)');

    console.log('Chart Parameters:', parameters);

    if (parameters.type === 'bar') {
        renderBarChart(svg, parameters);
    } else if (parameters.type === 'scatter') {
        renderScatterPlot(svg, parameters);
    } else if (parameters.type === 'grouped-bar') {
        renderGroupedBarChart(svg, parameters);
    }

    if (parameters.annotation) {
        const annotations = [{
            note: { label: parameters.annotation, title: parameters.title },
            x: parameters.annotationX, y: parameters.annotationY,
            dy: 100, dx: 100
        }];

        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        svg.append('g')
            .call(makeAnnotations);
    }
}

function renderBarChart(svg, parameters) {
    const x = d3.scaleBand()
        .domain(parameters.data.map(d => d.country))
        .range([0, 900])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d.happiness_score)])
        .range([700, 0]);

    svg.selectAll('.bar')
        .data(parameters.data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.happiness_score))
        .attr('width', x.bandwidth())
        .attr('height', d => 700 - y(d.happiness_score))
        .style('fill', 'steelblue');

    svg.append('g')
        .attr('transform', 'translate(0, 700)')
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}

function renderScatterPlot(svg, parameters) {
    const x = d3.scaleLinear()
        .domain(d3.extent(parameters.data, d => d.gdp_per_capita))
        .range([0, 900]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d.happiness_score)])
        .range([700, 0]);

    svg.selectAll('circle')
        .data(parameters.data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.gdp_per_capita))
        .attr('cy', d => y(d.happiness_score))
        .attr('r', 5)
        .style('fill', 'steelblue');

    svg.append('g')
        .attr('transform', 'translate(0, 700)')
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}

function renderGroupedBarChart(svg, parameters) {
    const factors = ['gdp_per_capita', 'social_support', 'healthy_life_expectancy', 'freedom_to_make_life_choices', 'generosity', 'perceptions_of_corruption'];
    const factorNames = {
        'gdp_per_capita': 'GDP per Capita',
        'social_support': 'Social Support',
        'healthy_life_expectancy': 'Healthy Life Expectancy',
        'freedom_to_make_life_choices': 'Freedom to Make Life Choices',
        'generosity': 'Generosity',
        'perceptions_of_corruption': 'Perceptions of Corruption'
    };

    const x0 = d3.scaleBand()
        .domain(parameters.data.map(d => d.country))
        .range([0, 900])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain(factors)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d3.max(factors, key => d[key]))])
        .range([700, 0]);

    svg.append('g')
        .selectAll('g')
        .data(parameters.data)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${x0(d.country)},0)`)
        .selectAll('rect')
        .data(d => factors.map(key => ({ key: key, value: d[key] })))
        .enter()
        .append('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => 700 - y(d.value))
        .attr('fill', d => d3.schemeCategory10[factors.indexOf(d.key)]);

    svg.append('g')
        .attr('transform', 'translate(0, 700)')
        .call(d3.axisBottom(x0));

    svg.append('g')
        .call(d3.axisLeft(y));

    const legend = svg.append('g')
        .attr('transform', 'translate(900,100)');

    factors.forEach((factor, i) => {
        legend.append('rect')
            .attr('x', 0)
            .attr('y', i * 20)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', d3.schemeCategory10[i]);

        legend.append('text')
            .attr('x', 20)
            .attr('y', i * 20 + 9)
            .text(factorNames[factor])
            .style('text-anchor', 'start');
    });
}

function nextScene() {
    if (currentScene < scenes.length - 1) {
        currentScene++;
        chart(scenes[currentScene]);
    }
}

function prevScene() {
    if (currentScene > 0) {
        currentScene--;
        chart(scenes[currentScene]);
    }
}

// Load data and initialize scenes
d3.csv('data/WHR_2023.csv').then(data => {
    console.log('Data Loaded:', data);

    data.forEach(d => {
        d.happiness_score = +d.happiness_score;
        d.gdp_per_capita = +d.gdp_per_capita;
        d.social_support = +d.social_support;
        d.healthy_life_expectancy = +d.healthy_life_expectancy;
        d.freedom_to_make_life_choices = +d.freedom_to_make_life_choices;
        d.generosity = +d.generosity;
        d.perceptions_of_corruption = +d.perceptions_of_corruption;
    });

    scenes = [
        {
            title: 'Scene 1: Happiness Scores of Top Countries in 2023',
            type: 'bar',
            data: data.slice(0, 10),
            annotation: 'This shows the happiness scores of the top 10 countries in 2023.',
            annotationX: 200,
            annotationY: 400
        },
        {
            title: 'Scene 2: Correlation Between GDP per Capita and Happiness Score',
            type: 'scatter',
            data: data.slice(0, 50),
            annotation: 'This shows the correlation between GDP per capita and happiness score for 50 countries.',
            annotationX: 300,
            annotationY: 300
        },
        {
            title: 'Scene 3: Comparison of Contributing Factors by Country',
            type: 'grouped-bar',
            data: data.slice(0, 10),
            annotation: 'This compares the factors contributing to happiness scores for the top 10 countries.',
            annotationX: 400,
            annotationY: 100
        }
    ];

    chart(scenes[currentScene]);
});

// Attach event listeners after defining nextScene and prevScene
document.getElementById('next').addEventListener('click', () => {
    console.log('Next button clicked');
    nextScene();
});

document.getElementById('previous').addEventListener('click', () => {
    console.log('Previous button clicked');
    prevScene();
});