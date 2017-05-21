CREATE PROCEDURE [dbo].[Page_Update]
	@websiteId int = 0,
	@pageId int = 0,
	@titlehead nvarchar(250) = '',
	@description nvarchar(160) = '',
	@pagetype int = 0,
	@layout nvarchar(30) = '',
	@service nvarchar(100) = '',
	@security bit = 0,
	@enabled bit = 1
AS
	UPDATE Pages SET
	title_head = @titlehead, [description] = @description,
	pagetype = CASE WHEN @pagetype >= 0 THEN @pagetype ELSE pagetype END,
	layout = @layout,
	[service] = @service,
	[security] = @security,
	[enabled] = @enabled
	WHERE pageId=@pageId AND websiteId=@websiteId

