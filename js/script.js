
let currentScene = 0;

function chart(parameters) {
    const introSection = document.getElementById('intro-section');
    const visualizationSection = document.getElementById('visualization-section');

    if (currentScene !== 0) {
        if (introSection) {
            introSection.style.display = 'none';
        }
        
        if (visualizationSection) {
            visualizationSection.style.display = 'block';
        }
    }

    d3.select('#visualization').html('');
    const plotWidth = 1400; //fixed 
    const plotHeight = 400; // Fixed height of 400px

    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', plotWidth)
        .attr('height', plotHeight);

    d3.select('#text-boxes').html(''); // Clear existing text boxes
    parameters.textBoxes.forEach(text => {
        d3.select('#text-boxes').append('div').attr('class', 'text-box').text(text);
    });
    
    d3.select('#scene-title').html(parameters.sceneTitle || '');
    if (parameters.type == 'bubble') {
        renderBubblePlot(svg, parameters, 1300, plotHeight);
    } else if (parameters.type === 'scatter') {
        renderScatterPlot(svg, parameters, plotWidth, plotHeight);
    } else if (parameters.type === 'line') {
        renderLineChart(svg, parameters, plotWidth, plotHeight);
    }

    if (parameters.annotations) {
        const annotations = parameters.annotations.map(ann => ({
            note: { 
                label: ann.label, 
                title: ann.title,
                align: "middle", // Add align property
                orientation: "leftRight" // Add orientation property
            },
            x: ann.x, // Set X coordinate for the point
            y: ann.y, // Set Y coordinate for the point
            dy: ann.dy, dx: ann.dx // Adjust these values to position the annotation and line
        }));

        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        svg.append('g')
            .call(makeAnnotations);
    }
    if (currentScene === 0) {
        if (introSection) {
            introSection.style.display = 'block';
        }
        
        if (visualizationSection) {
            visualizationSection.style.display = 'none';
        }
    }
}

const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

    function renderBubblePlot(svg, parameters, plotWidth, plotHeight) {
        const margin = { top: 60, right: 200, bottom: 80, left: 90 };
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
    
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    
        const size = d3.scaleSqrt()
            .domain(d3.extent(parameters.data, d => d.perceptions_of_corruption))
            .range([2, 17]);
    
        const circles = g.selectAll('circle')
            .data(parameters.data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d[parameters.x]))
            .attr('cy', d => y(d[parameters.y]))
            .attr('r', d => size(d.perceptions_of_corruption))
            .style('fill', d => color(d.region))
            .style('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this).style('fill', '#ccc');
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html(`Country: ${d.country}<br/>${parameters.xLabel}: ${d[parameters.x]}<br/>${parameters.yLabel}: ${d[parameters.y]}<br/>Perceptions of Corruption: ${d.perceptions_of_corruption}`)
                    .style('left', (event.pageX) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function(d) {
                d3.select(this).style('fill', d => color(d.region));
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    
        g.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));
    
        g.append('g')
            .call(d3.axisLeft(y));
    
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
    
        svg.append('text')
            .attr('x', margin.left + width / 2)
            .attr('y', margin.top - 20)
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text(parameters.title);
    
        const legend = svg.append('g')
            .attr('transform', `translate(${width + margin.left + 40}, ${margin.top})`);
    
        const regions = Array.from(new Set(parameters.data.map(d => d.region)));
        regions.forEach((region, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);
    
            legendRow.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', color(region))
                .on('mouseover', function() {
                    circles.classed('dimmed', d => d.region !== region)
                           .classed('filtered', d => d.region === region);
                })
                .on('mouseout', function() {
                    circles.classed('dimmed', false)
                           .classed('filtered', false);
                });
    
            legendRow.append('text')
                .attr('x', 20)
                .attr('y', 10)
                .attr('text-anchor', 'start')
                .style('font-size', '12px')
                .text(region)
                .on('mouseover', function() {
                    circles.classed('dimmed', d => d.region !== region)
                           .classed('filtered', d => d.region === region);
                })
                .on('mouseout', function() {
                    circles.classed('dimmed', false)
                           .classed('filtered', false);
                });
        });
    }
    
    
    
    
    

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

    // Define the zoom range for the Y axis
    const yZoomRange = [5, 6];

    // Adjust the Y scale to the zoomed range
    const y = d3.scaleLinear()
        .domain(yZoomRange)
        .range([height, 0]);

    // Filter the data to the zoom range
    const filteredData = parameters.data.filter(d => d.happiness_score >= yZoomRange[0] && d.happiness_score <= yZoomRange[1]);

    // Create the line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.happiness_score));

    // Append the path for the line chart
    g.append('path')
        .datum(filteredData)
        .attr('fill', 'none')
        .attr('stroke', 'darkorange')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    // Add the X axis
    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add the Y axis with the zoomed range
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
            title: 'fake scene',
            type: 'bubble',
            data: dataByYear[2023],
            x: 'social_support',
            y: 'happiness_score',
            xLabel: 'temp placement',
            yLabel: 'temp placement',
            annotations: [
                {
                    title: 'United States',
                    label: 'GDP per Capita: 1.39451, Happiness Score: 7.119',
                    x: 1050,
                    y: 75,
                    dy: 100,
                    dx: 100
                }
            ],
        textBoxes: [
            "this is temp placement"
        ]

        },
        {
            type: 'bubble',
            sceneTitle: 'çGDP per Capita vs. Happiness Score (2023)', // Add scene title
            data: dataByYear[2023],
            x: 'gdp_per_capita',
            y: 'happiness_score',
            r: 'population',
            region: 'region',
            xLabel: 'GDP per Capita',
            yLabel: 'Happiness Score',
            annotations: [
                {
                    title: 'United States',
                    label: 'GDP per Capita: 1.39451, Happiness Score: 7.119',
                    x: 920,
                    y: 80,
                    dy: 100,
                    dx: 100
                },
                {
                    title: 'Togo',
                    label: 'GDP per Capita: 0.20868, Happiness Score: 2.839',
                    x: 220,
                    y: 220,
                    dy: 30,
                    dx: 140
                },
                {
                    title: 'Bhutan',
                    label: 'GDP per Capita: 0.77042, Happiness Score: 5.253',
                    x: 550,
                    y: 140,
                    dy: -50,
                    dx: -50
                }
            ],
        textBoxes: [
            "🫧 This bubble plot shows the relationship between GDP per capita (economic wealth) and happiness score in 2023.",
            "ⓘ Each point represents a country, with its position on the horizontal axis showing its GDP per capita and its position on the vertical axis showing its happiness score. The size of each bubble is dependent on how citizens perceive the level of corruption",
            "🔎 Try hovering over each country to see its GDP per capita, 2023 happiness score, and perception of corruption. "
        ]
        },
        {
            type: 'bubble',
            sceneTitle: 'Social Support vs. Happiness Score (2023)', // Add scene title
            data: dataByYear[2023],
            x: 'social_support',
            y: 'happiness_score',
            xLabel: 'Social Support',
            yLabel: 'Happiness Score',
            annotations: [
                {
                    title: 'United States',
                    label: 'Social Support: 1.24711, Happiness Score: 7.119',
                    x: 990,
                    y: 75,
                    dy: 120,
                    dx: 60
                },
                {
                    title: 'Togo',
                    label: 'Social Support: 0.13995, Happiness Score: 2.839',
                    x: 190,
                    y: 220,
                    dy: 35,
                    dx: 100
                },
                {
                    title: 'Bhutan',
                    label: 'Social Support: 1.10395, Happiness Score: 5.253',
                    x: 880,
                    y: 140,
                    dy: -74,
                    dx: -50
                }
            ],
        textBoxes: [
            "🫧 This bubble plot shows the relationship between social support and happiness score in 2023.",
            "ⓘ Each point represents a country, with its position on the horizontal axis showing its social support and its position on the vertical axis showing its happiness score.",
            "🔎 Try hovering over the regions in the legend. You can see if some regions are happier."
        ]

        },
        {
            type: 'bubble',
            sceneTitle: 'Healthy Life Expectancy in 2023', // Add scene title
            data: dataByYear[2023],
            x: 'healthy_life_expectancy',
            y: 'happiness_score',
            xLabel: 'Healthy Life Expectancy',
            yLabel: 'Happiness Score',
            title: '2023',
        textBoxes: [
            "ⓘ This bubble plot shows the relationship between healthy life expectancy and happiness score in 2023.",
            "ⓘ Each point represents a country, with its position on the horizontal axis showing its healthy life expectancy and its position on the vertical axis showing its happiness score.",
            "ⓘ Try clicking the NEXT button to see the same plot but in the year 2015."
        ]
        },
        {
            type: 'bubble',
            sceneTitle: 'What about in 2015?', // Add scene title
            data: dataByYear[2015],
            x: 'healthy_life_expectancy',
            y: 'happiness_score',
            xLabel: 'Healthy Life Expectancy',
            yLabel: 'Happiness Score',
            title: '2015',
        textBoxes: [
            "ⓘ This bubble plot shows the relationship between healthy life expectancy and happiness score in 1015.",
            "ⓘ Each point represents a country, with its position on the horizontal axis showing its healthy life expectancy and its position on the vertical axis showing its happiness score.",
            "🔎 Notice differences? The healthy life expectancy decreased in 2015, accompanied by a slight decrease in happiness scores."
        ]
        },
        {
            sceneTitle: 'Happiness Scores Over Time (2015-2023)',
            type: 'line',
            data: Object.keys(dataByYear).map(year => ({
                year: new Date(year, 0, 1),
                happiness_score: d3.mean(dataByYear[year], d => d.happiness_score)
            })),
            annotation: 'This line chart shows the changes in average happiness scores over time from 2015 to 2023.',
            annotationX: 300,
            annotationY: 300,
        textBoxes: [
            "🔎 This line chart helps us visualize the slight downward trend in happiness scores from 2015 to 2023.",
            "🕵 So what influences the world's happiness scores? We found out that GDP per Capita, Social Support, and Healthy Life Expectancy are the main factors that influence our happiness.",
          "🤗 Hope you learned that the happiness levels in our world are significantly influenced by a variety of factors and are not independent."
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
document.getElementById('previous').addEventListener('click', previousScene);
document.getElementById('start-button').addEventListener('click', nextScene);

function resizeChart() {
    const plotWidth = document.getElementById('visualization').clientWidth;
    const plotHeight = 400; // Fixed height of 400px
    d3.select('#visualization svg')
        .attr('width', plotWidth)
        .attr('height', plotHeight);
    
    if (scenes && scenes[currentScene]) {
        chart(scenes[currentScene]);
    }
}
function nextScene() {
    currentScene++;
    if (currentScene >= scenes.length) {
        currentScene = 0;
    }
    chart(scenes[currentScene]);
}

function previousScene() {
    currentScene--;
    if (currentScene < 0) {
        currentScene = scenes.length - 1;
    }
    chart(scenes[currentScene]);
}

window.addEventListener('resize', resizeChart);
