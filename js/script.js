let currScene = 0;
function chart(param) {
    d3.select('#visualization').html('');
    
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', 800)
        .attr('height',600);
    
        if (param.type === 'bar') { // scene 1 - creating bar chart for happiness scores
        const x = d3.scaleBand()
            .domain(param.data.map(d => d.country))
            .range([50, 750])
            .padding (0.1);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(param.data, d => d.happiness_score)])
            .range([550, 50])
        
        svg.selectAll('.bar')
            .data(param.data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('s', d => x(d.country))
            .attr('l', d => y(d.happiness_score))
            .attr('width', x.bandwidth())
            .attr('height', d => 550 - y(happiness_score))
            .style('fill', 'steelblue');

        svg.append("g")
            .attr("transform", "translate(0,550)")
            .call(d3.axisBottom(x));
        svg.append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "translate(400,590)")
            .style("text-anchor", "middle")
            .text("Country");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -300)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Happiness Score");
    }  else if (parameters.type === 'scatter') { // scene 2 - scatter plot for GDP vs happiness score
        const x = d3.scaleLinear()
            .domain(d3.extent(parameters.data, d => d.gdp_per_capita))
            .range([50, 750]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(parameters.data, d => d.happiness_score)])
            .range([550, 50]);

        svg.selectAll('circle')
            .data(parameters.data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.gdp_per_capita))
            .attr('cy', d => y(d.happiness_score))
            .attr('r', 5)
            .style('fill', 'steelblue');

        svg.append("g")
            .attr("transform", "translate(0,550)")
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "translate(400,590)")
            .style("text-anchor", "middle")
            .text("GDP per Capita");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -300)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Happiness Score");
    }
}