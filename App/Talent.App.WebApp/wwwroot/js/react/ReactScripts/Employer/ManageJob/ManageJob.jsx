﻿import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Button, Image} from 'semantic-ui-react';

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
            activeIndex: ""
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

    render() {
        const { loadJobs } = this.state
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>

                <div className="ui container">
                    <Card.Group>
                        {loadJobs.map((item) =>
                            <React.Fragment>
                                <Card>
                                <Card.Content>    
                                  <Card.Header>{item.title}</Card.Header>
                                        <Card.Meta>{item.location.city},{item.location.country}</Card.Meta>
                                  <Card.Description> {item.summary} </Card.Description>                                 
                                </Card.Content>
                                    <Card.Content extra>
                                        <div>
                                            <Button negative floated='left' size='mini'>Expired</Button>
                                            <Button.Group compact floated='right'>
                                                <Button size='mini' basic color='blue'>
                                                Close
                                            </Button>
                                                <Button size='mini' size='mini'basic color='blue'>
                                                Edit
                                            </Button>
                                                <Button size='mini' size='mini' basic color='blue'>
                                                    Copy
                                            </Button>
                                            </Button.Group>
                                            </div>
                                </Card.Content>
                                </Card>
                            </React.Fragment>
                        )}
                    </Card.Group>
                </div>
            </BodyWrapper>
        )
    }
}