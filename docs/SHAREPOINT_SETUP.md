# Setting up Sharepoint and service configuration

Defra Forms now has the capability to save submissions to a Sharepoint list. This service listens to SNS/SQS for form submissions and, if the form exists in the service config, the form submission is saved as a row in the Sharepoint list.

This processing is independent of the forms-notify-listener messages even though the messages originate from the forms-submission-api i.e. the submission messages are independently received (and processed) by both forms-notify-listener and forms-sharepoint-listener.

## Pre-requisites

In order for a submission to get written to a Sharepoint list, the following is required:

- the values of formId, siteId, listId, and status (live or draft) must exist in the forms-sharepoint-listener config

- the Sharepoint list (denoted by siteId and listId) must contain ALL columns from the source form
  - the Sharepoint list column names must match the short description from each question **(and the naming is case-sensitive)**

  - the short descriptions from the form must all be unique (within the first 32 characters if spaces are removed)

  - the Sharepoint list column datatypes must match according to the ‘Datatype mappings’ table below

  - the Sharepoint list requires two extra columns: ‘Submission date’ (datatype: date and time, ensure ‘Include time’ is checked), and ‘Submission type’ (datatype: single line of text)

  - if repeater pages are used, appropriate columns should be available in the list up to the max number of repeats allowed (see ‘Repeater pages’ section below)

- the app reg used in the forms-sharepoint-listener config must have permissions to write to the appropriate list id(s) via MS Graph

## Repeater pages

If your form uses repeater pages, you need to setup the appropriate Sharepoint list columns in the format ‘<shortDescription> 1’, ‘<shortDescription> 2’, etc to the max repeats. So for a repeater that allows 3 repeats, and has 2 questions - one with a short description of ‘Field name’, the other with a short description of ‘Field area’ - you would need to create the following columns:

- Field name 1

- Field area 1

- Field name 2

- Field area 2

- Field name 3

- Field area 3

**Note** - there is a limit of 32 characters on the ‘internal’ column name (the name used to lookup the column) so any repeater short descriptions should be no more than 32 characters when the repeat number is added and spaces are removed e.g. ‘My repeater field 25’ (if my max repeaters is 25) which strips to ‘Myrepeaterfield25’ should be no longer than 32 characters.

## Configuration structure

The service configuration (set by the development team or CDP) consists of zero or more rows of the following structure:

```
{"mappings":[<rows-data>]}
```

The row structure is:

```
{"formId":"<form-id-guid>","siteId":"<site-id-guid>,"listId":"<list-id-guid>","status":"<draft-or-live>"}
```

A valid config value which prevents any forms saving to Sharepoint lists is:

```
{"mappings":[]}
```

A valid config value which allow two different forms to write to two different Sharepoint lists is:

```
{"mappings":[{"formId":"695e4ec0e57ae17190adacba","siteId":"071a12a4-5ed0-4a08-bbf6-93a762e89bdb","listId":"0695483b-f344-419f-bc93-ee8aeee1b788","status":"draft"},{"formId":"696104cfab2e01c384cf6382","siteId":"071a12a4-5ed0-4a08-bbf6-93a762e89bdb","listId":"69c339f4-5c06-42ab-89f9-7db121c61fc3","status":"live"}]}
```

## Determining the siteId and listId of a Sharepoint list

Normally a Sharepoint list is referred to by a url containing its site name and list name e.g. https://defradev.sharepoint.com/teams/TEAM164UAT/Lists/TestList1/AllItems.aspx

However, for the purposes of the config required when using this service, the id’s are required for site and list.

### List id

To find the listId:

1. Navigate to your list using the normal url

2. Click the settings cog in the top right of the header. This will pop up a panel with a series of links.

3. Click the ‘List settings’

4. Examine the url showing in the browser. It will have a ‘List=’ parameter at the end e.g. https://defradev.sharepoint.com/teams/TEAM164UAT/_layouts/15/listedit.aspx?List={69c339f4-5a06-42ab-89f9-7db121c61fc3} or https://defradev.sharepoint.com/teams/TEAM164UAT/_layouts/15/listedit.aspx?List=%7B69c339f4-5a06-42ab-89f9-7db121c61fc3%7D

5. Copy the value inside the ‘{' and ‘}’ (these characters may be escaped as ‘%7B’ and '%7D’)

6. In the above example, the list id is ‘69c339f4-5a06-42ab-89f9-7db121c61fc3’

### Site id

To find the site id:

1. Navigate to your list using the normal url. Note the site name in the top left corner

2. Navigate to MS Graph Explorer

3. Log in to your Defra or DefraDev account

4. Run this query (replacing ‘my-site-name’ with your site name): https://graph.microsoft.com/v1.0/sites?search=my-site-name

5. Examine the results, looking for ‘id’. Grab the value that looks like a guid. Hopefully only one guid will show but it may be that two or more appear - in which case you will have to try both in turn (usually the first one works) e.g.

```
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites(id)",
    "value": [
        {
            "id": "defradev.sharepoint.com,071a12a4-5ed0-4a08-bbf6-93a762e89bdb,613e0793-1c39-4678-906d-4a071c2d6ae5"
        }
    ]
}
```

## Datatype mappings

| Question type                | Sharepoint column datatype             |
| ---------------------------- | -------------------------------------- |
| TextField                    | Single line of text                    |
| MultilineTextField           | Multiple lines of text                 |
| NumberField                  | Number                                 |
| DatePartsField               | Date and time (uncheck ‘Include time’) |
| MonthYearField               | Date and time (uncheck ‘Include time’) |
| EmailAddressField            | Single line of text                    |
| TelephoneNumberField         | Single line of text                    |
| UkAddressField               | Single line of text                    |
| AutocompleteField            | Single line of text                    |
| CheckboxesField              | Single line of text                    |
| SelectField                  | Single line of text                    |
| RadiosField                  | Single line of text                    |
| YesNoField                   | Single line of text                    |
| DeclarationField             | Single line of text                    |
| EastingNorthingField         | Single line of text                    |
| LatLongField                 | Single line of text                    |
| OsGridRefField               | Single line of text                    |
| NationalGridFieldNumberField | Single line of text                    |
| FileUploadField              | Multiple lines of text                 |
