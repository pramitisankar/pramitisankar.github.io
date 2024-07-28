let currentScene = 0;

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
function chart(parameters) {
    d3.select('#visualization').html('');
    const plotWidth = d3.select('#visualization').node().getBoundingClientRect().width;
    const plotHeight = plotWidth * 0.6;
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', plotWidth)
        .attr('height', plotHeight);

    d3.select('#text-boxes').html(''); // Clear existing text boxes
    parameters.textBoxes.forEach(text => {
        d3.select('#text-boxes').append('div').attr('class', 'text-box').text(text);
    });

    if (parameters.type === 'map') {
        renderWorldMap(svg, parameters, plotWidth, plotHeight);
    } else if (parameters.type === 'scatter') {
        renderScatterPlot(svg, parameters, plotWidth, plotHeight);
    } else if (parameters.type === 'line') {
        renderLineChart(svg, parameters, plotWidth, plotHeight);
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

// Define the tooltip
const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

function renderScatterPlot(svg, parameters, plotWidth, plotHeight) {
    const margin = { top: 60, right: 40, bottom: 80, left: 90 };
    const width = plotWidth - margin.left - margin.right;
    const height = plotHeight - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(parameters.data, d => d[parameters.x]))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d[parameters.y])])
        .range([height, 0]);

    g.selectAll('circle')
        .data(parameters.data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[parameters.x]))
        .attr('cy', d => y(d[parameters.y]))
        .attr('r', 5)
        .style('fill', 'darkorange')
        .on('mouseover', function(event, d) {
            d3.select(this).style('fill', '#ccc');
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Country: ${d.country}<br/>${parameters.xLabel}: ${d[parameters.x]}<br/>${parameters.yLabel}: ${d[parameters.y]}`)
                .style('left', (event.pageX) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('fill', 'darkorange');
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append('text')
        .attr('transform', `translate(${margin.left + width / 2}, ${plotHeight - 10})`)
        .style('text-anchor', 'middle')
        .text(parameters.xLabel);

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 50)
        .attr('x', -(margin.top + height / 2))
        .style('text-anchor', 'middle')
        .text(parameters.yLabel);

    // Add plot title
    svg.append('text')
        .attr('x', margin.left + width / 2)
        .attr('y', margin.top - 20)
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text(parameters.title);
}

function renderLineChart(svg, parameters, plotWidth, plotHeight) {
    const margin = { top: 40, right: 40, bottom: 70, left: 70 };
    const width = plotWidth - margin.left - margin.right;
    const height = plotHeight - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(parameters.data, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d.happiness_score)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.happiness_score));

    g.append('path')
        .datum(parameters.data)
        .attr('fill', 'none')
        .attr('stroke', 'darkorange')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append('text')
        .attr('transform', `translate(${margin.left + width / 2}, ${margin.top + height + 40})`)
        .style('text-anchor', 'middle')
        .text('Year');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 50)
        .attr('x', -(margin.top + height / 2))
        .style('text-anchor', 'middle')
        .text('Happiness Score');

    // Add plot title
    svg.append('text')
        .attr('x', margin.left + width / 2)
        .attr('y', margin.top - 20)
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text(parameters.title);
}

function initializeScenes(dataByYear) {
    scenes = [
        {
            title: 'Scene 1: GDP per Capita vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'gdp_per_capita',
            y: 'happiness_score',
            xLabel: 'GDP per Capita',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between GDP per capita and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300,
            title: 'Scene 1: GDP per Capita vs. Happiness Score (2023)',
        textBoxes: [
            "This scatter plot shows the relationship between GDP per capita and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its GDP per capita and its position on the vertical axis showing its happiness score.",
            "The scatter plot helps us understand how economic wealth correlates with the overall happiness of a country."
        ]
        },
        {
            title: 'Scene 2: Social Support vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'social_support',
            y: 'happiness_score',
            xLabel: 'Social Support',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between social support and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300,
            title: 'Scene 2: Social Support vs. Happiness Score (2023)',
        textBoxes: [
            "This scatter plot shows the relationship between social support and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its social support and its position on the vertical axis showing its happiness score.",
            "The plot highlights the importance of social support in determining the overall happiness of a country."
        ]

        },
        {
            title: 'Scene 3: Healthy Life Expectancy vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'healthy_life_expectancy',
            y: 'happiness_score',
            xLabel: 'Healthy Life Expectancy',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between healthy life expectancy and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300,
            title: 'Scene 3: Healthy Life Expectancy vs. Happiness Score (2023)',
        textBoxes: [
            "This scatter plot shows the relationship between healthy life expectancy and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its healthy life expectancy and its position on the vertical axis showing its happiness score.",
            "The plot underscores the role of health and longevity in contributing to the overall happiness of a country."
        ]
        },
        {
            title: 'Scene 4: Freedom to Make Life Choices vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'freedom_to_make_life_choices',
            y: 'happiness_score',
            xLabel: 'Freedom to Make Life Choices',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between freedom to make life choices and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300,
            title: 'Scene 4: Freedom to Make Life Choices vs. Happiness Score (2023)',
        textBoxes: [
            "This scatter plot shows the relationship between freedom to make life choices and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its freedom to make life choices and its position on the vertical axis showing its happiness score.",
            "The plot emphasizes the significance of personal freedom in determining the overall happiness of a country."
        ]
        },
        {
            title: 'Scene 5: Happiness Scores Over Time (2015-2023)',
            type: 'line',
            data: Object.keys(dataByYear).map(year => ({
                year: new Date(year, 0, 1),
                happiness_score: d3.mean(dataByYear[year], d => d.happiness_score)
            })),
            annotation: 'This line chart shows the changes in average happiness scores over time from 2015 to 2023.',
            annotationX: 300,
            annotationY: 300,
            title: 'Scene 5: Happiness Scores Over Time (2015-2023)',
        textBoxes: [
            "This line chart shows the changes in average happiness scores over time from 2015 to 2023.",
            "The horizontal axis represents the years, while the vertical axis represents the average happiness score.",
            "The line chart helps us visualize trends and changes in happiness scores over the specified period."
        ]
        }
    ];

    chart(scenes[currentScene]);
}


Promise.all([
    d3.csv('data/WHR_2023.csv'),
    d3.csv('data/WHR_2022.csv'),
    d3.csv('data/WHR_2021.csv'),
    d3.csv('data/WHR_2020.csv'),
    d3.csv('data/WHR_2019.csv'),
    d3.csv('data/WHR_2018.csv'),
    d3.csv('data/WHR_2017.csv'),
    d3.csv('data/WHR_2016.csv'),
    d3.csv('data/WHR_2015.csv')
]).then(datasets => {
    const dataByYear = {};
    datasets.forEach((data, i) => {
        data.forEach(d => {
            d.happiness_score = +d.happiness_score;
            d.gdp_per_capita = +d.gdp_per_capita;
            d.social_support = +d.social_support;
            d.healthy_life_expectancy = +d.healthy_life_expectancy;
            d.freedom_to_make_life_choices = +d.freedom_to_make_life_choices;
            d.generosity = +d.generosity;
            d.perceptions_of_corruption = +d.perceptions_of_corruption;
        });
        dataByYear[2015 + i] = data;
    });

    // initialize scenes
    initializeScenes(dataByYear);
});


document.getElementById('next').addEventListener('click', nextScene);
document.getElementById('previous').addEventListener('click', prevScene);

function resizeChart() {
    const plotWidth = document.getElementById('visualization').clientWidth;
    const plotHeight = plotWidth * 0.6;
    d3.select('#visualization svg')
        .attr('width', plotWidth)
        .attr('height', plotHeight);
    
    // Redraw the current scene
    if (scenes && scenes[currentScene]) {
        chart(scenes[currentScene]);
    }
}

window.addEventListener('resize', resizeChart);