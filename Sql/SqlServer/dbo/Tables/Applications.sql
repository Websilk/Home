CREATE TABLE [dbo].[Applications] (
    [applicationId]     NVARCHAR (10)  NOT NULL,
    [title]             NVARCHAR (25)  NOT NULL,
    [name]              NVARCHAR (25)  NOT NULL,
    [version]			NVARCHAR (10)  NOT NULL,
    [description]       NVARCHAR (200) NOT NULL,
    [companyName]       NVARCHAR (50)  NOT NULL,
    [companyUrl]		NVARCHAR (50)  NULL, 
    [category]			INT			   NOT NULL,
    CONSTRAINT [PK_Applications] PRIMARY KEY ([applicationId])
);


GO

CREATE INDEX [index_applications] ON [dbo].[Applications] (applicationId)