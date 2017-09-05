CREATE PROCEDURE [dbo].[Page_Update]
	@websiteId int = 0,
	@pageId int = 0,
	@title nvarchar(250) = '',
	@description nvarchar(160) = '',
	@security bit = 0,
	@enabled bit = 1
AS
	UPDATE Pages SET
	[title] = @title,
	[description] = @description,
	[security] = @security,
	[enabled] = @enabled
	WHERE pageId=@pageId AND websiteId=@websiteId
