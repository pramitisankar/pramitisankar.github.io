let currentScene = 0;
let scenes = [];

const countryNameMapping = {
    "United States": "United States of America",
    "Russia": "Russian Federation",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of",
    "Czech Republic": "Czechia",
    "Ivory Coast": "Côte d'Ivoire",
    "Venezuela": "Venezuela (Bolivarian Republic of)",
    "Tanzania": "Tanzania, United Republic of",
    "Syria": "Syrian Arab Republic",
    "Laos": "Lao People's Democratic Republic",
    "Vietnam": "Viet Nam",
    "Bolivia": "Bolivia (Plurinational State of)",
    "Brunei": "Brunei Darussalam",
    "Moldova": "Republic of Moldova",
    "Swaziland": "Eswatini",
    "Iran": "Iran (Islamic Republic of)",
    "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
    "Cape Verde": "Cabo Verde",
    "Congo (Kinshasa)": "Democratic Republic of the Congo",
    "Congo (Brazzaville)": "Republic of the Congo",
    "Slovakia": "Slovak Republic",
    "Libya": "Libya",
    "Sao Tome and Principe": "São Tomé and Príncipe",
    "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "St. Lucia": "Saint Lucia",
    "St. Vincent and the Grenadines": "Saint Vincent and the Grenadines",
    "Micronesia": "Micronesia (Federated States of)",
    "Palestine": "Palestine, State of"
};

function chart(parameters) {
    d3.select('#visualization').html('');
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '600px')
        .attr('viewBox', '0 0 1000 600')
        .append('g')
        .attr('transform', 'translate(50, 50)');

    if (parameters.type === 'map') {
        renderWorldMap(svg, parameters);
    } else if (parameters.type === 'scatter') {
        renderScatterPlot(svg, parameters);
    } else if (parameters.type === 'line') {
        renderLineChart(svg, parameters);
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

// tooltips
const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

function renderWorldMap(svg, parameters) {
    d3.json('https://d3js.org/world-110m.v1.json').then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;

        const projection = d3.geoMercator()
            .scale(150)
            .translate([500, 300]);

        const path = d3.geoPath().projection(projection);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, d3.max(parameters.data, d => d.happiness_score)]);

        svg.append('g')
            .selectAll('path')
            .data(countries)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', d => {
                let countryName = d.properties.name || d.properties.ADMIN || d.properties.admin;
                countryName = countryNameMapping[countryName] || countryName;
                const country = parameters.data.find(c => c.Country === countryName);
                if (!country) {
                    console.log('No match for:', countryName);
                } else {
                    console.log('Match found:', countryName, country.happiness_score);
                }
                return country ? colorScale(country.happiness_score) : '#ccc';
            })
            .attr('stroke', '#999')
            .on('mouseover', function(event, d) {
                let countryName = d.properties.name || d.properties.ADMIN || d.properties.admin;
                countryName = countryNameMapping[countryName] || countryName;
                const country = parameters.data.find(c => c.Country === countryName);
                if (country) {
                    d3.select(this).attr('fill', 'darkorange');
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html(`Country: ${country.Country}<br/>Happiness Score: ${country.happiness_score}`)
                        .style('left', (event.pageX) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                }
            })
            .on('mouseout', function(event, d) {
                let countryName = d.properties.name || d.properties.ADMIN || d.properties.admin;
                countryName = countryNameMapping[countryName] || countryName;
                const country = parameters.data.find(c => c.Country === countryName);
                d3.select(this).attr('fill', country ? colorScale(country.happiness_score) : '#ccc');
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    });
}


function renderScatterPlot(svg, parameters) {
    const x = d3.scaleLinear()
        .domain(d3.extent(parameters.data, d => d[parameters.x]))
        .range([0, 900]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d[parameters.y])])
        .range([700, 0]);

    svg.selectAll('circle')
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

    svg.append('g')
        .attr('transform', 'translate(0, 700)')
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
}

function renderLineChart(svg, parameters) {
    const x = d3.scaleTime()
        .domain(d3.extent(parameters.data, d => d.year))
        .range([0, 900]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(parameters.data, d => d.happiness_score)])
        .range([700, 0]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.happiness_score));

    svg.append('path')
        .datum(parameters.data)
        .attr('fill', 'none')
        .attr('stroke', 'darkorange')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    svg.append('g')
        .attr('transform', 'translate(0, 700)')
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));
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
        console.log('Data for year', 2015 + i, data);
    });

    scenes = [
        {
            title: 'Scene 1: Global Happiness Overview (2023)',
            type: 'map',
            data: dataByYear[2023],
            annotation: 'This map shows the happiness scores across the world in 2023.',
            annotationX: 200,
            annotationY: 400
        },
        {
            title: 'Scene 2: GDP per Capita vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'gdp_per_capita',
            y: 'happiness_score',
            xLabel: 'GDP per Capita',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between GDP per capita and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300
        },
        {
            title: 'Scene 3: Social Support vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'social_support',
            y: 'happiness_score',
            xLabel: 'Social Support',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between social support and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300
        },
        {
            title: 'Scene 4: Healthy Life Expectancy vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'healthy_life_expectancy',
            y: 'happiness_score',
            xLabel: 'Healthy Life Expectancy',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between healthy life expectancy and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300
        },
        {
            title: 'Scene 5: Freedom to Make Life Choices vs. Happiness Score (2023)',
            type: 'scatter',
            data: dataByYear[2023],
            x: 'freedom_to_make_life_choices',
            y: 'happiness_score',
            xLabel: 'Freedom to Make Life Choices',
            yLabel: 'Happiness Score',
            annotation: 'This scatter plot shows the relationship between freedom to make life choices and happiness score in 2023.',
            annotationX: 300,
            annotationY: 300
        },
        {
            title: 'Scene 6: Happiness Scores Over Time (2015-2023)',
            type: 'line',
            data: Object.keys(dataByYear).map(year => ({
                year: new Date(year, 0, 1),
                happiness_score: d3.mean(dataByYear[year], d => d.happiness_score)
            })),
            annotation: 'This line chart shows the changes in average happiness scores over time from 2015 to 2023.',
            annotationX: 300,
            annotationY: 300
        }
    ];

    chart(scenes[currentScene]);
});

document.getElementById('next').addEventListener('click', nextScene);
document.getElementById('previous').addEventListener('click', prevScene);

function resizeChart() {
    const width = document.getElementById('visualization').clientWidth;
    d3.select('#visualization svg')
      .attr('width', width)
      .attr('height', width * 0.6);
}

window.addEventListener('resize', resizeChart);

