let currentScene = 0;

/* function startVisualization() {
    currentScene = 0; // Set the initial scene to 0
    const introSection = document.getElementById('intro-section');
    const visualizationSection = document.getElementById('visualization-section');

    if (introSection) {
        introSection.style.display = 'none'; // Hide the intro section
    }

    if (visualizationSection) {
        visualizationSection.style.display = 'block'; // Show the visualization section
    }

    chart(scenes[currentScene]); // Render the first scene
}
document.getElementById("start-button").addEventListener("click", startVisualization); */

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
    const plotWidth = d3.select('#visualization').node().getBoundingClientRect().width;
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

    if (parameters.type === 'scatter') {
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
            title: ' fake scene)',
            type: 'scatter',
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
            type: 'scatter',
            sceneTitle: 'Scene 1: GDP per Capita vs. Happiness Score (2023)', // Add scene title
            data: dataByYear[2023],
            x: 'gdp_per_capita',
            y: 'happiness_score',
            xLabel: 'GDP per Capita',
            yLabel: 'Happiness Score',
            annotations: [
                {
                    title: 'United States',
                    label: 'GDP per Capita: 1.39451, Happiness Score: 7.119',
                    x: 1050,
                    y: 75,
                    dy: 100,
                    dx: 100
                },
                {
                    title: 'Togo',
                    label: 'GDP per Capita: 0.20868, Happiness Score: 2.839',
                    x: 230,
                    y: 220,
                    dy: 50,
                    dx: 100
                },
                {
                    title: 'Bhutan',
                    label: 'GDP per Capita: 0.77042, Happiness Score: 5.253',
                    x: 620,
                    y: 140,
                    dy: -50,
                    dx: -50
                }
            ],
        textBoxes: [
            "This scatter plot shows the relationship between GDP per capita and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its GDP per capita and its position on the vertical axis showing its happiness score.",
            "The scatter plot helps us understand how economic wealth correlates with the overall happiness of a country."
        ]
        },
        {
            type: 'scatter',
            sceneTitle: 'Scene 2: Social Support vs. Happiness Score (2023)', // Add scene title
            data: dataByYear[2023],
            x: 'social_support',
            y: 'happiness_score',
            xLabel: 'Social Support',
            yLabel: 'Happiness Score',
            annotations: [
                {
                    title: 'United States',
                    label: 'GDP per Capita: 1.39451, Happiness Score: 7.119',
                    x: 1050,
                    y: 75,
                    dy: 100,
                    dx: 100
                },
                {
                    title: 'Togo',
                    label: 'GDP per Capita: 0.20868, Happiness Score: 2.839',
                    x: 230,
                    y: 220,
                    dy: 50,
                    dx: 100
                },
                {
                    title: 'Bhutan',
                    label: 'GDP per Capita: 0.77042, Happiness Score: 5.253',
                    x: 620,
                    y: 140,
                    dy: -50,
                    dx: -50
                }
            ],
        textBoxes: [
            "This scatter plot shows the relationship between social support and happiness score in 2023.",
            "Each point represents a country, with its position on the horizontal axis showing its social support and its position on the vertical axis showing its happiness score.",
            "The plot highlights the importance of social support in determining the overall happiness of a country."
        ]

        },
        {
            type: 'scatter',
            sceneTitle: 'Scene 3: Healthy Life Expectancy vs. Happiness Score (2023)', // Add scene title
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
            type: 'scatter',
            data: dataByYear[2023],
            sceneTitle:'Scene 4: Freedom to Make Life Choices vs. Happiness Score (2023)',
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
            sceneTitle: 'Scene 5: Happiness Scores Over Time (2015-2023)',
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