let currScene = 0;
function chart(param) {
    d3.select('#visualization').html('');
    
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', 800)
        .attr('height',600);
    
        if (param.type === 'bar') { // creating bar chart for happiness scores
        const s = d3.scaleBand()
            .domain(param.data.map(d => d.country))
            .range([50, 750])
            .padding (0.1);
        
        const l = d3.scaleLinear()
            .domain([0, d3.max(param.data, d => d.happiness_score)])
            .range([550, 50])
        
        svg.selectAll('.bar')
            .data(param.data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('s', d => s(d.country))
            .attr('l', d => l(d.happiness_score))
            .attr('width', s.bandwidth())
            .attr('height', d => 550 - l(happiness_score))
            .style('fill', 'steelblue');
    }
}