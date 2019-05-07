import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Button, Label } from 'semantic-ui-react';

import EditJob from './EditJob.jsx';
import CreateJob from '../CreateJob/CreateJob.jsx';
import consts from '../../APIConstants.js'

const sortOptions = [
    {
        key: 'Newest first',
        text: 'Newest first',
        value: 'Newest first',        
    },
    {
        key: 'Oldest First',
        text: 'Oldest First',
        value: 'Oldest First',    
    },
]

const filterOptions = [
    {
        key: "Choose filter",
        text: "Choose filter",
        value: "Choose filter"
    }
]

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            currentPage: 0,
            limit: 2,
            paginatedData: [],
            firstoffset: 0,
            lastOffset: 2,
            showEditSection: false,
            editId:0
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = false;
        this.setState({ loaderData, });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.loadData();

    };

    loadData() {

        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here
        $.ajax({
            url: consts.talentAPIBaseUrl +'/listing/listing/GetSortedEmployerJobs',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            data: {
                activePage: this.state.activePage,
                sortbyDate: this.state.sortBy.date,
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true

            },
            contentType: "Application/json",
            dataType: "JSON",
            success: function (res) {
                let jobList = null;
                if (res.myJobs) {
                    jobList = res.myJobs;

                    this.setState({
                        loadJobs: jobList
                    })
                    this.prepareTable(this.state.firstoffset, this.state.lastOffset);
                }
                
            }.bind(this),
            error: function (res) {
                console.log(res.status);
            }

        })
        this.init();
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    onPageChanged = (event) => {
        console.log("onpagechange", event.target);
    }

    prepareTable = (firstIndex, lastIndex) => {
        let tableData = [];
        tableData = this.state.loadJobs.slice(firstIndex, lastIndex);
        this.setState({
            paginatedData: tableData
        })
    }

    handleChange = (event) => {

        let current = 0;
        current = event.target.getAttribute("value");
        this.setState({
            currentPage: current
        });
        const lastIndex = current * this.state.limit;
        const firstIndex = lastIndex - this.state.limit;
        this.prepareTable(firstIndex, lastIndex);

       // console.log("inside", current);
       // console.log("inside", event.target.getAttribute("value"));

    }

    closeJob(id) {
        var cookies = Cookies.get('talentAuthToken');    
        $.ajax({
            url: consts.talentAPIBaseUrl +'/listing/listing/closeJob',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(id),
            type: "POST",
            contentType: "Application/json",
            dataType: "JSON",
            success: function (res) {
                this.loadData();
                console.log(res.messages);
            }.bind(this),
            error: function (res) {
                console.log(res.status);
            }

        })     
    }

    editJob(id) {
        console.log("editcalled",id);
        this.setState({
            showEditSection: true,
            editId:id
        })
    }

    

    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }

    renderDisplay() {
        const { loadJobs, paginatedData, limit } = this.state
        let tableData = null;
        if (loadJobs.length == 0) {
            tableData = <p>    No Jobs found </p>
        }
        else {
            tableData =
                paginatedData.map((item) =>             
                            
                    <Card>                       
                        <Card.Content >
                            <Card.Header>{item.title}</Card.Header>
                            <Label as='a' color='black' ribbon='right'>
                                <Icon className="user" />
                                 0
                            </Label>
                            <Card.Meta>{item.location.city},{item.location.country}</Card.Meta>
                            <Card.Description className="description job-summary"> {item.summary} </Card.Description>
                         </Card.Content>                   
                         <Card.Content extra className="cardContent">
                            <div>
                               <Button compact color='red'  size='mini'>Expired</Button>
                               <Button.Group compact floated='right' size='mini'>
                                    <Button icon='close'content="Close" basic color='blue' onClick={() => this.closeJob(item.id)} />
                                    <Button icon='edit' content="Edit"  basic color='blue' onClick={() => this.editJob(item.id)} />
                                    <Button icon='copy' content="Copy"  basic color='blue' />
                               </Button.Group>
                            </div>                               
                         </Card.Content>                       
                    </Card>                
                                     
                )
        }

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <React.Fragment>  
                    <div className="ui container">
                        <h1> List of Jobs</h1>
                    <span>
                        <Icon className="filter" />
                        Filter:{' '}
                        <Dropdown className = "cardDisplay"
                            inline
                            options={filterOptions}
                            defaultValue={filterOptions[0].value}
                        />
                        <Icon className="calendar alternate " />
                        Sort by date: {' '}
                        <Dropdown
                            inline
                            options={sortOptions}
                            defaultValue={sortOptions[0].value}
                        />
                    </span>                   
                    <Card.Group>                      
                       {tableData}                      
                    </Card.Group>                       
                </div>

                <div className = "page" >
                <Pagination 
                    defaultActivePage={1} 
                    totalPages={Math.ceil(loadJobs.length/limit)}
                    onClick={(event, data) => this.handleChange(event)}
                    onPageChange={(event, data) => this.onPageChanged(event)}
                    />
                    </div>
                </React.Fragment>
            </BodyWrapper>
            )
    }

    renderEdit() {
        return (
            <EditJob jobId={this.state.editId} />
        )
    }



}