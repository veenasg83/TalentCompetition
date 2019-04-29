import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Button, Label} from 'semantic-ui-react';


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
            lastOffset: 2
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
            url: 'http://localhost:51689/listing/listing/GetSortedEmployerJobs',
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
                console.log("ajax", res);
                console.log("ajax", jobList);

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

        console.log("inside", current);
        console.log("inside", event.target.getAttribute("value"));

    }

    closeJob = () => {
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:51689/listing/listing/closeJob',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            contentType: "Application/json",
            dataType: "JSON",
            success: function (res) {

                console.log(res.messages);
            }.bind(this),
            error: function (res) {
                console.log(res.status);
            }

        })     
    }

    

    render() {
        const { loadJobs, paginatedData,limit } = this.state
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>

                <div className="ui container">
                    <span>
                        <Icon className="filter" />
                        Filter:{' '}
                        <Dropdown
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
                    <div>
                    <Card.Group>
                        {paginatedData.map((item) =>
                            <React.Fragment>
                                    <Card>
                                 
                                        <Card.Content>   
                                           
                                            <Card.Header>{item.title}</Card.Header>
                                            <Label as='a' color='black' ribbon='right'>
                                                <Icon className="user" />
                                                0
                                            </Label>
                                        <Card.Meta>{item.location.city},{item.location.country}</Card.Meta>
                                  <Card.Description> {item.summary} </Card.Description>                                 
                                </Card.Content>
                                    <Card.Content extra>
                                        <div>
                                            <Button negative floated='left' size='mini'>Expired</Button>
                                            <Button.Group compact floated='right'>
                                                    <Button icon='close' content = "Close" size='mini' basic color='blue'  onClick={this.closeJob}/>                                         
                                                    <Button icon='edit' content= "Edit" size='mini' size='mini'basic color='blue'/>                                            
                                                    <Button icon='copy' content="Copy" size='mini' size='mini' basic color='blue' />                                            
                                            </Button.Group>
                                            </div>
                                </Card.Content>
                                </Card>
                            </React.Fragment>
                        )}
                        </Card.Group>
                        </div>
                </div>
                <div >
                <Pagination 
                    defaultActivePage={1} 
                    totalPages={Math.ceil(loadJobs.length/limit)}
                    onClick={(event, data) => this.handleChange(event)}
                    onPageChange={(event, data) => this.onPageChanged(event)}
                    />
                </div>
            </BodyWrapper>
        )
    }
}