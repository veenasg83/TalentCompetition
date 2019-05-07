import React from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';
import { JobDetailsCard } from '../CreateJob/JobDetailsCard.jsx';
import { JobApplicant } from '../CreateJob/JobApplicant.jsx';
import { ChildSingleInput } from '../../Form/SingleInput.jsx'
import { JobDescription } from '../CreateJob/JobDescription.jsx';
import { JobSummary } from '../CreateJob/JobSummary.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import consts from '../../APIConstants.js';

export default class EditJob extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jobData: {
                id: this.props.jobId,
                employerID: "",
                title: "",
                description: "",
                summary: "",
                applicantDetails: {
                    yearsOfExperience: { years: 1, months: 1 },
                    qualifications: [],
                    visaStatus: []
                },
                jobDetails: {
                    categories: { category: "", subCategory: "" },
                    jobType: [],
                    startDate: moment(),
                    salary: { from: 0, to: 0 },
                    location: { country: "", city: "" }
                }
            },
            loaderData: loaderData
        }
        this.updateStateData = this.updateStateData.bind(this);
        this.addUpdateJob = this.addUpdateJob.bind(this);
        this.loadData = this.loadData.bind(this);

        this.init = this.init.bind(this);
    };

    init() {
        let loaderData = this.state.loaderData;
        loaderData.allowedUsers.push("Employer");
        loaderData.allowedUsers.push("Recruiter");
        loaderData.isLoading = false;
        this.setState({ loaderData, })
    }

    componentDidMount() {
        this.init();
        this.loadData();
    };

    loadData() {
        let param = this.state.jobData.id;
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: consts.talentAPIBaseUrl +'/listing/listing/GetJobByToEdit?id=' + param,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                if (res.success == true) {
                    res.jobData.jobDetails.startDate = moment(res.jobData.jobDetails.startDate);
                    res.jobData.jobDetails.endDate = res.jobData.jobDetails.endDate ? moment(res.jobData.jobDetails.endDate) : null;
                    res.jobData.expiryDate = res.jobData.expiryDate
                        ? moment(res.jobData.expiryDate) > moment()
                            ? moment(res.jobData.expiryDate) : moment().add(14, 'days') : null;
                    this.setState({ jobData: res.jobData })
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }
            }.bind(this)
        })
    }

    addUpdateJob() {
        var jobData = this.state.jobData;
        console.log("data to save:", jobData);
        //jobData.jobDetails.startDate = jobData.jobDetails.startDate.toDate();
        console.log("date:", jobData.jobDetails.startDate);
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: consts.talentAPIBaseUrl +'/listing/listing/createUpdateJob',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            type: "post",
            data: JSON.stringify(jobData),
            success: function (res) {
                if (res.success == true) {
                    TalentUtil.notification.show(res.message, "success", null, null);
                    window.location = "/ManageJobs";

                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }

            }.bind(this)
        })
    }

    updateStateData(event) {
        const data = Object.assign({}, this.state.jobData)
        data[event.target.name] = event.target.value
        this.setState({
            jobData: data
        })
        console.log(data);
    }

    render() {
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <section className="page-body">
                    <div className="ui container">
                        <div className="ui grid">
                            <div className="row">
                                <div className="sixteen wide center aligned padded column">
                                    <h1>Edit Job</h1>
                                </div>
                            </div>

                            <div className="row">
                                <div className="sixteen wide column">
                                    <div className="ui form">
                                        <div className="ui grid">
                                            <div className="row">
                                                <div className="twelve wide column">
                                                    <label>* are required fields. Please enter all required fields.</label>
                                                    <h5>
                                                        *Title:
                                                    </h5>
                                                    <ChildSingleInput
                                                        inputType="text"
                                                        name="title"
                                                        value={this.state.jobData.title}
                                                        controlFunc={this.updateStateData}
                                                        maxLength={80}
                                                        placeholder="Enter a title for your job"
                                                        errorMessage="Please enter a valid title"
                                                    />
                                                    <h5>
                                                        *Description:
                                                    </h5>
                                                    <JobDescription
                                                        description={this.state.jobData.description}
                                                        controlFunc={this.updateStateData}
                                                    />
                                                    <br />
                                                    <h5>
                                                        *Summary:
                                                    </h5>
                                                    <JobSummary
                                                        summary={this.state.jobData.summary}
                                                        updateStateData={this.updateStateData} />
                                                    <br />

                                                    <br />
                                                    <JobApplicant
                                                        applicantDetails={this.state.jobData.applicantDetails}
                                                        updateStateData={this.updateStateData}
                                                    />
                                                    <br />
                                                </div>
                                                <div className="four wide column">
                                                    <JobDetailsCard
                                                        expiryDate={this.state.jobData.expiryDate}
                                                        jobDetails={this.state.jobData.jobDetails}
                                                        updateStateData={this.updateStateData}
                                                        createClick={this.addUpdateJob}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <br />
                </section>
            </BodyWrapper>
        )
    }
}